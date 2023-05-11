import { Router } from "express";
import { FolderModel, IUserFolder } from "../models/folder";
import { UserModel } from "../models/user";

const routes = Router();

// Get a single folder by id
routes.get("/", async (req, res) => {
  try {
    const { folderId } = req.query;
    const folder: IUserFolder | null = await FolderModel.findOne(
      { $or: [{ _id: folderId as string, isDeletedByUser: false }, { _id: folderId as string, isDeletedByUser: { $exists: false } }] },
      { isDeletedByUser: 0 }
    ).exec();
    return res.status(201).json(folder);
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
    const updatedDashboardFolders = await UserModel.findByIdAndUpdate(
      newFolder.creator,
      {
        $push: {
          dashboardFolders: newFolder._id
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ newFolder, updatedDashboardFolders });
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
    const updatedDashboardFolders = await UserModel.findByIdAndUpdate(
      folder!.creator,
      {
        $pull: {
          dashboardFolders: folder!._id
        }
      },
      { new: true }
    ).exec();
    const updatedDashboardBoxes = await UserModel.findByIdAndUpdate(
      folder!.creator,
      {
        $push: {
          dashboardBoxes: { $each: boxIds }
        }
      }
    ).exec();
    return res.status(201).json({ updatedDashboardFolders, updatedDashboardBoxes });
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
      }
    ).exec();
    const updatedDashboardBoxes = await UserModel.findByIdAndUpdate(
      updatedFolder!.creator,
      {
        $pull: {
          dashboardBoxes: boxId
        }
      }
    ).exec();
    return res.status(201).json({ updatedFolder, updatedDashboardBoxes });
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
          boxes: { _id: boxId }
        }
      }
    ).exec();
    const updatedDashboardBoxes = await UserModel.findByIdAndUpdate(
      updatedFolder!.creator,
      {
        $push: {
          dashboardBoxes: boxId
        }
      }
    ).exec();
    return res.status(201).json({ updatedFolder, updatedDashboardBoxes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});