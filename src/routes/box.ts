import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";
import { SectionSorting } from "../types/interfaces";
import mongoose from "mongoose";

const routes = Router();

// Get a single box by id
routes.get("/", async (req, res) => {
  try {
    const { boxId } = req.query;
    const box: IUserBox | null = await BoxModel.findOne(
      {$or: [{_id: boxId as string, isDeletedByUser: false}, {_id: boxId as string, isDeletedByUser: { $exists : false }}]},
      {isDeletedByUser: 0}
    ).exec();
    return res.status(201).json(box);
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
      replacementBox,
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Delete a box
routes.delete("/:boxId", async (req, res) => {
  try {
    const { boxId } = req.params;
    const updatedBox = await BoxModel.findOneAndUpdate(
      {_id: boxId as string},
      {isDeletedByUser: true},
      {new: true}
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.artists);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.albums);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.tracks);
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
      {new: true}
    ).exec();
    return res.status(201).json(updatedBox?.playlists);
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
      {new: true}
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
      {new: true}
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
      {new: true}
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
        arrayFilters: [ { "elem._id": itemId } ],
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
        arrayFilters: [ { "elem._id": subsectionId } ],
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
      {new: true}
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
          "notes.$[elem].noteText" : noteText 
        }
      },
      {
        arrayFilters: [ { "elem._id": noteId } ],
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
          "subSections.$[elem].name" : name
        }
      },
      {
        arrayFilters: [ { "elem._id": subsectionId } ],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.subSections);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
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
      {new: true}
    ).exec();
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $unset: {
          [`${section}.$[elem].subSection`]: ""
        }
      },
      {
        arrayFilters: [ { "elem.subSection": subsectionId } ],
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
