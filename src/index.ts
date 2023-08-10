import "./lib/db";
import express from "express";
import cors from "cors";
import boxRoutes from "./routes/box";
import folderRoutes from "./routes/folder";
import userRoutes from "./routes/user"
import spotifyRoutes from "./routes/spotify"
import boxArtists from "./routes/box/artists";
import boxAlbums from "./routes/box/albums";
import boxTracks from "./routes/box/tracks";
import boxPlaylists from "./routes/box/playlists";

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
app.use("/api/boxes", boxArtists);
app.use("/api/boxes", boxAlbums);
app.use("/api/boxes", boxTracks);
app.use("/api/boxes", boxPlaylists);
app.use("/api/folders", folderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/spotify", spotifyRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
