import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";
import { UserModel, IUser } from "../models/user";
import { FolderModel, IUserFolder } from "../models/folder";

const routes = Router();

// Get a user's data by Spotify id
routes.get("/", async (req, res) => {
  try {
    const { spotifyId } = req.query;
    const userData: IUser | null = await UserModel.findOne({ services: {spotify: spotifyId as string} }).exec();
    return res.json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Create a new user
routes.post("/", async (req, res) => {
  try {
    const user: Omit<IUser, "_id"> = req.body;
    const newUser = await UserModel.create(user);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Get a user's created boxes
routes.get("/:userId/boxes", async (req, res) => {
  try {
    const { userId } = req.params;
    const boxes: IUserBox[] = await BoxModel.find(
      {$or: [{creator: userId as string, isDeletedByUser: false}, {creator: userId as string, isDeletedByUser: { $exists : false }}]},
      {isDeletedByUser: 0}
    ).exec();
    const boxesData = boxes.map(box => ({boxId: box._id, boxName: box.name}))
    return res.json(boxesData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Get a user's created folders
routes.get("/:userId/folders", async (req, res) => {
  try {
    const { userId } = req.params;
    const folders: IUserFolder[] = await FolderModel.find(
      {creator: userId as string}
    ).exec();
    return res.json(folders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a user's dashboard folders
routes.put("/:userId/dashboardFolders", async (req, res) => {
  try {
    const { userId } = req.params;
    const { updatedFolderList } = req.body;
    const updatedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      { dashboardFolders: updatedFolderList },
      { 
        upsert: true,
        new: true 
      }
    ).exec();
    return res.json(updatedUser?.dashboardFolders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Update a user's dashboard boxes
routes.put("/:userId/dashboardBoxes", async (req, res) => {
  try {
    const { userId } = req.params;
    const { updatedBoxIdList } = req.body;
    const updatedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      { dashboardBoxes: updatedBoxIdList },
      { 
        upsert: true,
        new: true 
      }
    ).exec();
    return res.json(updatedUser?.dashboardBoxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Add element to a user's dashboard boxes
routes.post("/:userId/dashboardBoxes", async (req, res) => {
  try {
    const { userId } = req.params;
    const { newId } = req.body;
    const updatedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: { 
          dashboardBoxes: newId 
        }
      },
      { 
        new: true 
      }
    ).exec();
    return res.json(updatedUser?.dashboardBoxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Remove an element from a user's dashboard boxes
routes.delete("/:userId/dashboardBoxes", async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetId } = req.body;
    const updatedUser: IUser | null = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { 
          dashboardBoxes: targetId 
        }
      },
      { 
        new: true 
      }
    ).exec();
    return res.json(updatedUser?.dashboardBoxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
