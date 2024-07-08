import { Router } from "express";
import { IUserBox, BoxModel } from "../../../models/box";
import mongoose from "mongoose";

const routes = Router();

// Add an album to a box
routes.post("/:boxId/albums", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newAlbum } = req.body;

    // Check if the album already exists in the box
    const boxHasAlbum = await BoxModel.findOne({ _id: boxId, "albums.id": newAlbum.id }).exec();

    if (boxHasAlbum) {
      return res.status(400).json({ error: "Item already in box" });
    }

    const updatedBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $push: { albums: newAlbum } },
      { new: true }
    ).exec();

    return res.status(201).json(updatedBox?.albums);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box's albums
routes.put("/:boxId/albums", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { updatedItems } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          albums: updatedItems
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.albums);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Reorder an album in a box
routes.put("/:boxId/albums/reorder", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;
    const box = await BoxModel.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found.' });
    }

    const albums = box.albums;
    const [targetItem] = albums.splice(sourceIndex, 1);
    albums.splice(destinationIndex, 0, targetItem);
    const updatedBox = await BoxModel.findOneAndUpdate(
      { _id: boxId },
      { $set: { albums } },
      { new: true }
    ).exec();

    return res.status(200).json({ updatedBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a single album in a box
routes.put("/:boxId/albums/:albumId", async (req, res) => {
  try {
    const { boxId, albumId } = req.params;
    const { updatedAlbum } = req.body;
    const updatedUserBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $set: { "albums.$[elem]": updatedAlbum } },
      { arrayFilters: [{ "elem._id": albumId }], new: true }
    ).exec();
    return res.status(200).json({ updatedUserBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add an album to a subsection
routes.put("/:boxId/albums/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId, itemData } = req.body;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $inc: {
          "albums.$[elem].subSectionCount": 1
        }
      },
      {
        arrayFilters: [{ "elem._id": itemId }],
        new: true
      }
    ).exec();
    const updatedBox = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $push: {
          "subSections.$[elem].items":
          {
            ...itemData,
            _id: new mongoose.Types.ObjectId()
          }
        }
      },
      {
        arrayFilters: [{ "elem._id": subsectionId }],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Remove an album from a subsection
routes.put("/:boxId/albums/:itemId/subsection/remove", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId } = req.body;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $inc: {
          "albums.$[elem].subSectionCount": -1
        }
      },
      {
        arrayFilters: [{ "elem._id": itemId }],
        new: true
      }
    ).exec();
    const updatedBox = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          "subSections.$[elem].items": { _id: itemId }
        }
      },
      {
        arrayFilters: [{ "elem._id": subsectionId }],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Delete an album from a box
routes.delete("/:boxId/albums/:itemId", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          albums: { _id: itemId }
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.albums);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;