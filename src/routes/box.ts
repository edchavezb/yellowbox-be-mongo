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

// Change a artist's subsection
routes.put("/:boxId/artists/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "artists.$[elem].subSection": subsectionId
        }
      },
      {
        arrayFilters: [ { "elem._id": itemId } ],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.artists);
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

// Change a album's subsection
routes.put("/:boxId/albums/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "albums.$[elem].subSection": subsectionId
        }
      },
      {
        arrayFilters: [ { "elem._id": itemId } ],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.albums);
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

// Change a track's subsection
routes.put("/:boxId/tracks/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "tracks.$[elem].subSection": subsectionId
        }
      },
      {
        arrayFilters: [ { "elem._id": itemId } ],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.tracks);
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

// Change a playlist's subsection
routes.put("/:boxId/playlists/:itemId/subsection", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { subsectionId } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "playlists.$[elem].subSection": subsectionId
        }
      },
      {
        arrayFilters: [ { "elem._id": itemId } ],
        new: true
      }
    ).exec();
    return res.status(201).json(updatedBox?.playlists);
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
routes.put("/:boxId/notes/:itemId", async (req, res) => {
  try {
    const { boxId, itemId } = req.params;
    const { noteText } = req.body;
    const updatedBox: IUserBox | null = await BoxModel.findByIdAndUpdate(
      boxId,
      {
        $set: {
          "notes.$[elem].noteText" : noteText 
        }
      },
      {
        arrayFilters: [ { "elem.itemId": itemId } ],
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
