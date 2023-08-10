import { Router } from "express";
import { IUserBox, BoxModel } from "../../../models/box";
import mongoose from "mongoose";

const routes = Router();

// Add a playlist to a box
routes.post("/:boxId/playlists", async (req, res) => {
    try {
      const { boxId } = req.params;
      const { newPlaylist } = req.body;
      const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
        { _id: boxId, "playlists.id": { $ne: newPlaylist.id } },
        { $push: { playlists: newPlaylist } }
      ).exec();
      return res.status(201).json(updatedBox?.playlists);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sorry, something went wrong :/" });
    }
  });
  
  // Update a box's playlists
  routes.put("/:boxId/playlists", async (req, res) => {
    try {
      const { boxId } = req.params;
      const { updatedItems } = req.body;
      const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
        boxId,
        {
          $set: {
            playlists: updatedItems
          }
        },
        { new: true }
      ).exec();
      return res.status(201).json(updatedBox?.playlists);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sorry, something went wrong :/" });
    }
  });
  
  // Reorder a playlist in a box
  routes.put("/:boxId/playlists/reorder", async (req, res) => {
    try {
      const { boxId } = req.params;
      const { sourceIndex, destinationIndex } = req.body;
      const box = await BoxModel.findById(boxId);
      if (!box) {
        return res.status(404).json({ message: 'Box not found.' });
      }
  
      const playlists = box.playlists;
      const [targetItem] = playlists.splice(sourceIndex, 1);
      playlists.splice(destinationIndex, 0, targetItem);
      const updatedBox = await BoxModel.findOneAndUpdate(
        { _id: boxId },
        { $set: { playlists } },
        { new: true }
      ).exec();
  
      return res.status(200).json({ updatedBox });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sorry, something went wrong :/" });
    }
  });
  
  // Update a single playlist in a box
  routes.put("/:boxId/playlists/:playlistId", async (req, res) => { 
    try {
      const { boxId, playlistId } = req.params;
      const { updatedPlaylist } = req.body;
      const updatedUserBox = await BoxModel.findByIdAndUpdate(
        boxId,
        { $set: { "playlists.$[elem]": updatedPlaylist } },
        { arrayFilters: [{ "elem._id": playlistId }], new: true }
      ).exec();
      return res.status(200).json({ updatedUserBox });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sorry, something went wrong :/" });
    }
  });
  
  // Add a playlist to a subsection
routes.put("/:boxId/playlists/:itemId/subsection", async (req, res) => {
    try {
      const { boxId, itemId } = req.params;
      const { subsectionId, itemData } = req.body;
      await BoxModel.findByIdAndUpdate(
        boxId,
        {
          $inc: {
            "playlists.$[elem].subSectionCount": 1
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
  
  // Remove a playlist from a subsection
  routes.put("/:boxId/playlists/:itemId/subsection/remove", async (req, res) => {
    try {
      const { boxId, itemId } = req.params;
      const { subsectionId } = req.body;
      await BoxModel.findByIdAndUpdate(
        boxId,
        {
          $inc: {
            "playlist.$[elem].subSectionCount": -1
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
        { new: true }
      ).exec();
      return res.status(201).json(updatedBox?.playlists);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Sorry, something went wrong :/" });
    }
  });

  export default routes;