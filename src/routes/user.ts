import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";
import { UserModel, IUser } from "../models/user";

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

// Get a user's boxes
routes.get("/:userId/boxes", async (req, res) => {
  try {
    const { userId } = req.params;
    const boxes: IUserBox[] = await BoxModel.find({creator: userId as string}).exec();
    return res.json(boxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

export default routes;
