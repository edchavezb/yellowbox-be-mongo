import "./lib/db";
import express from "express";
import cors from "cors";
import boxRoutes from "./routes/box";
import userRoutes from "./routes/user"

const app = express();
const port = process.env.PORT || 3333;

app.use(express.json());
app.use(express.raw({ type: "application/vnd.custom-type" }));
app.use(express.text({ type: "text/html" }));
app.use(cors());

app.get("/api", async (req, res) => {
  res.json({ message: "Please visit /countries to view all the countries" });
});

app.use("/api/boxes", boxRoutes);
app.use("/api/users", userRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
