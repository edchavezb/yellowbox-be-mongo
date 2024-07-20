import { Router } from "express";
import { FolderModel, IUserFolder } from "../../models/folder";
import { UserModel } from "../../models/user";
import { extractArrayQueryParam } from "../../helpers";
import mongoose from "mongoose";

const routes = Router();

// Get a single folder by id
routes.get("/", async (req, res) => {
  try {
    const { folderId } = req.query;
    const folder: IUserFolder | null = await FolderModel.findOne(
      { _id: folderId as string }
    ).exec();
    const creator = await UserModel.findById(folder?.creator)
    return res.status(201).json({folderData: folder, creatorName: creator?.username});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Get a group of folders that match an array of ids 
routes.get("/multiple", async (req, res) => {
  try {
    const folderIds = extractArrayQueryParam(req, 'id');
    const unsortedFolders = await FolderModel.find(
      { _id: { $in: folderIds.map(mongoose.Types.ObjectId) } }
    ).exec();
    let sortingLookup: {[key: string]: IUserFolder} = {}
    unsortedFolders.forEach(x => sortingLookup[x._id] = x)
    const sortedFolders = folderIds.map(key => sortingLookup[key])
    return res.status(201).json(sortedFolders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Create a folder
routes.post("/", async (req, res) => {
  try {
    const userFolder: Omit<IUserFolder, "_id"> = req.body;
    const newFolder = await FolderModel.create(userFolder);
    const updatedUser = await UserModel.findByIdAndUpdate(
      newFolder.creator,
      {
        $push: {
          dashboardFolders: newFolder._id
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ newFolder, updatedDashboardFolders: updatedUser?.dashboardFolders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a folder
routes.put("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    const updatedFolder: IUserFolder = req.body;

    const result: IUserFolder | null = await FolderModel.findOneAndReplace(
      { _id: folderId as string },
      updatedFolder,
      { new: true }
    ).exec();
    return res.status(201).json({updatedFolder: result});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Delete a folder
routes.delete("/:folderId", async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder: IUserFolder | null = await FolderModel.findById(folderId)
    await FolderModel.findByIdAndDelete(
      folderId
    ).exec();
    const boxIds = folder?.boxes.map(folderBox => folderBox.boxId)
    await UserModel.findByIdAndUpdate(
      folder!.creator,
      {
        $pull: {
          dashboardFolders: folder!._id
        }
      }
    ).exec();
    const updatedUser = await UserModel.findByIdAndUpdate(
      folder!.creator,
      {
        $push: {
          dashboardBoxes: { $each: boxIds }
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ updatedDashboardFolders: updatedUser!.dashboardFolders, updatedDashboardBoxes: updatedUser!.dashboardBoxes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add a box to a folder
routes.post("/:folderId/boxes", async (req, res) => {
  try {
    const { folderId } = req.params;
    const { boxId, boxName } = req.body;
    const updatedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      {
        $push: {
          boxes: { boxId, boxName }
        }
      },
      { new: true }
    ).exec();
    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedFolder!.creator,
      {
        $pull: {
          dashboardBoxes: boxId
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ updatedFolder, updatedDashboardBoxes: updatedUser!.dashboardBoxes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a folder's boxes
routes.put("/:folderId/boxes", async (req, res) => {
  try {
    const { folderId } = req.params;
    const { updatedItems } = req.body;
    const updatedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      {
        $set: {
          boxes: updatedItems
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ updatedFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a folder box's name
routes.put("/:folderId/boxes/:boxId", async (req, res) => {
  try {
    const { folderId, boxId } = req.params;
    const { name } = req.body;
    const updatedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      {
        $set: {
          "boxes.$[elem].boxName": name
        }
      },
      {
        arrayFilters: [{ "elem.boxId": boxId }],
        new: true
      }
    ).exec();
    return res.status(201).json({ updatedFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Remove a box from a folder
routes.delete("/:folderId/boxes/:boxId", async (req, res) => {
  try {
    const { folderId, boxId } = req.params;
    const updatedFolder = await FolderModel.findByIdAndUpdate(
      folderId,
      {
        $pull: {
          boxes: { boxId: boxId }
        }
      },
      { new: true }
    ).exec();
    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedFolder!.creator,
      {
        $push: {
          dashboardBoxes: boxId
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ updatedFolder, updatedDashboardBoxes: updatedUser!.dashboardBoxes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Move a box between folders
routes.put("/:sourceId/boxes/:boxId/move", async (req, res) => {
  try {
    const { sourceId, boxId } = req.params;
    const { targetId, boxName } = req.body;
    const updatedSourceFolder = await FolderModel.findByIdAndUpdate(
      sourceId,
      {
        $pull: {
          boxes: { boxId: boxId }
        }
      },
      { new: true }
    ).exec();
    const updatedTargetFolder = await FolderModel.findByIdAndUpdate(
      targetId,
      {
        $push: {
          boxes: { boxId, boxName }
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ updatedSourceFolder, updatedTargetFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;