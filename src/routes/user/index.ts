import { Router } from "express";
import { BoxModel, IUserBox } from "../../models/box";
import { UserModel, IUser } from "../../models/user";
import { FolderModel, IUserFolder } from "../../models/folder";
import authenticate from "../../middleware/autenticate"

const routes = Router();

// Get the authenticated user's data
routes.get("/me", authenticate, async (req, res) => {
  res.status(200).json({appUser: req.user});
});

// Get a user's data by Spotify id
// routes.get("/", async (req, res) => {
//   try {
//     const { spotifyId } = req.query;
//     const userData: IUser | null = await UserModel.findOne({ services: {spotify: spotifyId as string} }).exec();
//     return res.json(userData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Sorry, something went wrong :/" });
//   }
// });

// Check if username exists
routes.get("/check/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const usernameCount = await UserModel.countDocuments({username});
    return res.status(201).json({usernameExists: !!usernameCount});
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

// Update a user
routes.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userData: IUser = req.body;

    const updatedUser: IUser | null = await UserModel.findOneAndReplace(
      { _id: userId as string },
      userData,
      { new: true }
    ).exec();
    return res.status(201).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Set a user's email address as verified
routes.put("/:userId/verifyEmail", async (req, res) => {
  try {
    const { userId } = req.params;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { 'account.emailVerified': true } },
      { new: true }
    ).exec();
    return res.status(201).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

// Link a user to a Spotify account
routes.post("/:userId/spotify", async (req, res) => {
  try {
    const { userId } = req.params;
    const { spotifyData } = req.body;

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { 'services.spotify': spotifyData } },
      { new: true }
    ).exec();
    return res.status(201).json(updatedUser);
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
