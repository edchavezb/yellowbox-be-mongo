import { Router } from "express";
import { BoxModel, IUserBox } from "../models/box";

const routes = Router();

// Get a user's boxes
routes.get("/userboxes", async (req, res) => {
  try {
    const { userId } = req.query;
    const boxes: IUserBox[] = await BoxModel.find({creator: userId as string}).exec();
    return res.json(boxes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Sorry, something went wrong :/" });
  }
});

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
routes.put("/", async (req, res) => {
  try {
    const { boxId } = req.query;
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

export default routes;
