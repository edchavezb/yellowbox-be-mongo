import { Router } from "express";
import { IUserBox, BoxModel } from "../../../models/box";
import mongoose from "mongoose";

const routes = Router();

// Add an artist to a box
routes.post("/:boxId/artists", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newArtist } = req.body;

    // Check if the artist already exists in the box
    const boxHasArtist = await BoxModel.findOne({ _id: boxId, "artists.id": newArtist.id }).exec();

    if (boxHasArtist) {
      return res.status(400).json({ error: "Item already in box" });
    }

    const updatedBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $push: { artists: newArtist } },
      { new: true }
    ).exec();

    return res.status(201).json(updatedBox?.artists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a box's artists
routes.put("/:boxId/artists", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { updatedItems } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          artists: updatedItems
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.artists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Reorder an artist in a box
routes.put("/:boxId/artists/reorder", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { sourceIndex, destinationIndex } = req.body;
    const box = await BoxModel.findById(boxId);
    if (!box) {
      return res.status(404).json({ message: 'Box not found.' });
    }

    const artists = box.artists;
    const [targetItem] = artists.splice(sourceIndex, 1);
    artists.splice(destinationIndex, 0, targetItem);
    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId },
      { $set: { artists } },
      { new: true }
    ).exec();

    return res.status(200).json({ updatedBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a single artist in a box
routes.put("/:boxId/artists/:artistId", async (req, res) => {
  try {
    const { boxId, artistId } = req.params;
    const { updatedArtist } = req.body;
    const updatedUserBox = await BoxModel.findByIdAndUpdate(
      boxId,
      { $set: { "artists.$[elem]": updatedArtist } },
      { arrayFilters: [{ "elem._id": artistId }], new: true }
    ).exec();
    return res.status(200).json({ updatedUserBox });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add an artist to a subsection
routes.put("/:boxId/artists/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId, itemData } = req.body;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $inc: {
          "artists.$[elem].subSectionCount": 1
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

// Remove an artist from a subsection
routes.put("/:boxId/artists/:itemId/subsection/remove", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId, spotifyId } = req.body;
    await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $inc: {
          "artists.$[elem].subSectionCount": -1
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
          "subSections.$[elem].items": { id: spotifyId }
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

// Delete an artist from a box
routes.delete("/:boxId/artists/:itemId", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          artists: { _id: itemId }
        }
      },
      { new: true }
    ).exec();
    return res.status(201).json(updatedBox?.artists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;