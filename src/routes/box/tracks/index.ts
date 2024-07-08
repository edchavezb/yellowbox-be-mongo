import { Router } from "express";
import { IUserBox, BoxModel } from "../../../models/box";
import mongoose from "mongoose";

const routes = Router();

// Add a track to a box
routes.post("/:boxId/tracks", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newTrack } = req.body;

    // Check if the track already exists in the box
    const boxHasTrack = await BoxModel.findOne({ _id: boxId, "tracks.id": newTrack.id }).exec();

    if (boxHasTrack) {
      return res.status(400).json({ error: "Item already in box" });
    }

    const updatedBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $push: { tracks: newTrack } },
      { new: true }
    ).exec();

    return res.status(201).json(updatedBox?.tracks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box's tracks
routes.put("/:boxId/tracks", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { updatedItems } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          tracks: updatedItems
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.tracks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Reorder a track in a box
routes.put("/:boxId/tracks/reorder", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;
    const box = await BoxModel.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found.' });
    }

    const tracks = box.tracks;
    const [targetItem] = tracks.splice(sourceIndex, 1);
    tracks.splice(destinationIndex, 0, targetItem);
    const updatedBox = await BoxModel.findOneAndUpdate(
      { _id: boxId },
      { $set: { tracks } },
      { new: true }
    ).exec();

    return res.status(200).json({ updatedBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a single track in a box
routes.put("/:boxId/tracks/:trackId", async (req, res) => {
  try {
    const { boxId, trackId } = req.params;
    const { updatedTrack } = req.body;
    const updatedUserBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $set: { "tracks.$[elem]": updatedTrack } },
      { arrayFilters: [{ "elem._id": trackId }], new: true }
    ).exec();
    return res.status(200).json({ updatedUserBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add a track to a subsection
routes.put("/:boxId/tracks/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId, itemData } = req.body;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $inc: {
          "tracks.$[elem].subSectionCount": 1
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

// Remove a track from a subsection
routes.put("/:boxId/tracks/:itemId/subsection/remove", async (req, res) => {
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

// Delete a track from a box
routes.delete("/:boxId/tracks/:itemId", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          tracks: { _id: itemId }
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.tracks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;