import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";

const routes = Router();

routes.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const boxes: IUserBox[] = await BoxModel.find({creator: userId as string}).exec();
    return res.json(boxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

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

export default routes;
