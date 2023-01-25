import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";
import { SectionSorting } from "../types/interfaces";

const routes = Router();

// Get a single box by id
routes.get("/", async (req, res) => {
  try {
    const { boxId } = req.query;
    const box: IUserBox | null = await BoxModel.findOne({_id: boxId as string}).exec();
    return res.json(box);
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
    return res.status(201).json(newBox);
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
      {_id: boxId as string},
      replacementBox
    ).exec();
    return res.status(201).json(updatedBox);
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
      {_id: boxId as string},
      {sectionSorting: updatedSorting},
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.sectionSorting);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.artists);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.albums);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.tracks);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Delete a playlist from a box
routes.delete("/:boxId/playlists/:itemId", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $pull: {
          playlists: { _id: itemId }
        }
      },
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.playlists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
