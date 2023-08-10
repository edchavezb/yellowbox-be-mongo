import { Router } from "express";
import { BoxModel, IUserBox } from "../../models/box";
import { SectionSorting } from "../../types/interfaces";
import mongoose from "mongoose";
import { extractArrayQueryParam } from "../../helpers";
import { UserModel } from "../../models/user";
import { FolderModel } from "../../models/folder";

const routes = Router();

// Get a single box by id
routes.get("/", async (req, res) => {
  try {
    const { boxId } = req.query;
    const box: IUserBox | null = await BoxModel.findOne(
      { $or: [{ _id: boxId as string, isDeletedByUser: false }, { _id: boxId as string, isDeletedByUser: { $exists: false } }] },
      { isDeletedByUser: 0 }
    ).exec();
    const creator = await UserModel.findById(box?.creator)
    return res.status(201).json({ boxData: box, creatorName: creator?.displayName });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Get a group of boxes that match an array of ids 
routes.get("/multiple", async (req, res) => {
  try {
    const boxIds = extractArrayQueryParam(req, 'id');
    const unsortedBoxes = await BoxModel.find(
      { _id: { $in: boxIds.map(mongoose.Types.ObjectId) } }
    ).exec();
    let sortingLookup: { [key: string]: IUserBox } = {}
    unsortedBoxes.forEach(x => sortingLookup[x._id] = x)
    const sortedBoxes = boxIds.map(key => sortingLookup[key])
    const dashboardBoxes = sortedBoxes.map(box => ({ boxId: box._id, boxName: box.name }))
    return res.status(201).json(dashboardBoxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Create a box
routes.post("/", async (req, res) => {
  try {
    const userBox: Omit<IUserBox, "_id"> = req.body;
    const newBox = await BoxModel.create(userBox);
    await UserModel.findByIdAndUpdate(
      newBox!.creator,
      {
        $push: {
          dashboardBoxes: newBox._id
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json({ boxId: newBox._id, boxName: newBox.name });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box
routes.put("/:boxId", async (req, res) => {
  try {
    const { boxId } = req.params;
    const replacementBox: IUserBox = req.body;

    const updatedBox: IUserBox | null = await BoxModel.findOneAndReplace(
      { _id: boxId as string },
      replacementBox,
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Delete a box
routes.put("/:boxId/delete", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { containingFolder, folderId } = req.body;
    const updatedBox = await BoxModel.findOneAndUpdate(
      { _id: boxId as string },
      { isDeletedByUser: true },
      { new: true }
    ).exec();
    if (containingFolder) {
      const updatedFolder = await FolderModel.findByIdAndUpdate(
        folderId,
        { $pull: { boxes: { boxId: boxId } } },
        { new: true }
      ).exec();
      return res.status(201).json(updatedFolder);
    }
    else {
      const updatedUser = await UserModel.findByIdAndUpdate(
        updatedBox!.creator,
        {
          $pull: {
            dashboardBoxes: boxId
          }
        },
        { new: true }
      ).exec();
      return res.status(201).json(updatedUser);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box's section sorting settings
routes.put("/:boxId/sectionSorting", async (req, res) => {
  try {
    const { boxId } = req.params;
    const updatedSorting: SectionSorting = req.body;

    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId as string },
      { sectionSorting: updatedSorting },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.sectionSorting);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

routes.put("/:boxId/boxInfo", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { name, publicBool, description } = req.body;

    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId as string },
      {
        $set: {
          name: name,
          public: publicBool,
          description: description
        }
      },
      { new: true }
    ).exec();
    
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add a note to the notes in a box
routes.post("/:boxId/notes", async (req, res) => {
  try {
    const { boxId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $push: {
          notes: req.body
        }
      },
      {
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.notes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Edit a note in a box
routes.put("/:boxId/notes/:noteId", async (req, res) => {
  try {
    const { boxId, noteId } = req.params;
    const { noteText } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "notes.$[elem].noteText": noteText
        }
      },
      {
        arrayFilters: [{ "elem._id": noteId }],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.notes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add a subsection to a box
routes.post("/:boxId/subsections", async (req, res) => {
  try {
    const { boxId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $push: {
          subSections: req.body
        }
      },
      {
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.subSections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box's subsections
routes.put("/:boxId/subsections", async (req, res) => {
  try {
    const { boxId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          subSections: req.body
        }
      },
      {
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.subSections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Edit a subsection's name
routes.put("/:boxId/subsections/:subsectionId", async (req, res) => {
  try {
    const { boxId, subsectionId } = req.params;
    const { name } = req.body
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "subSections.$[elem].name": name
        }
      },
      {
        arrayFilters: [{ "elem._id": subsectionId }],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.subSections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Reorder items in a subsection
routes.put('/:boxId/subsections/:subsectionId/reorder', async (req, res) => {
  try {
    const { boxId, subsectionId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;

    // Find the box by its ID
    const box = await BoxModel.findById(boxId);

    if (!box) {
      return res.status(404).json({ message: 'Box not found.' });
    }

    const subsection = box.subSections.find(sub => sub._id.toString() === subsectionId);
    if (!subsection) {
      throw new Error('Subsection not found.');
    }

    const [targetItem] = subsection.items.splice(sourceIndex, 1);
    subsection.items.splice(destinationIndex, 0, targetItem);
    const updatedBox = await BoxModel.findOneAndUpdate(
      { _id: boxId },
      { $set: { subSections: box.subSections } },
      { new: true }
    ).exec();

    res.status(200).json({ message: 'Items in the subsection reordered successfully.', updatedSubsections: updatedBox?.subSections });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// Delete a subsection
routes.delete("/:boxId/subsections/:subsectionId", async (req, res) => {
  try {
    const { boxId, subsectionId } = req.params;
    const { section } = req.query;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          subSections: { _id: subsectionId }
        }
      },
      { new: true }
    ).exec();
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $unset: {
          [`${section}.$[elem].subSection`]: ""
        }
      },
      {
        arrayFilters: [{ "elem.subSection": subsectionId }],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
