import { Router } from "express";
import { UserModel, IUser } from "../models/user";

const routes = Router();

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

export default routes;
