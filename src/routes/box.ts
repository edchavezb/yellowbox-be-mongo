import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";
import { SectionSorting } from "../types/interfaces";
import mongoose from "mongoose";
import { extractArrayQueryParam } from "../helpers";
import { UserModel } from "../models/user";
import { FolderModel } from "../models/folder";

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

// Add an artist to a box
routes.post("/:boxId/artists", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newArtist } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId, "artists.id": { $ne: newArtist.id } },
      { $push: { artists: newArtist } }
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

// Add an album to a box
routes.post("/:boxId/albums", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newAlbum } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId, "albums.id": { $ne: newAlbum.id } },
      { $push: { albums: newAlbum } }
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

// Add a track to a box
routes.post("/:boxId/tracks", async (req, res) => {
  try {
    const { boxId } = req.params;
    const { newTrack } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findOneAndUpdate(
      { _id: boxId, "tracks.id": { $ne: newTrack.id } },
      { $push: { tracks: newTrack } }
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
