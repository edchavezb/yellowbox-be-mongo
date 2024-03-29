import { model, Document } from "mongoose";
import { Album, Artist, Playlist, Sorting, Track, Visibility } from "../types/interfaces";
import { BoxSchema } from "../types/schemas";

interface IUserBox extends Document {
  name: string
  public: boolean
  creator: string
  description: string
  artists: Artist[]
  albums: Album[]
  tracks: Track[]
  playlists: Playlist[]
  sectionSorting: {
    artists: Sorting
    albums: Sorting
    tracks: Sorting
    playlists: Sorting
  }
  sectionVisibility: Visibility
  subSections: { _id: string ,type: string, name: string, index: number, items: Artist[] | Album[] | Track[] | Playlist[] }[]
  notes: { itemId: string, noteText: string }[]
  isDeletedByUser?: boolean
}

const BoxModel = model<IUserBox>("Box", BoxSchema);

export { BoxModel, IUserBox };
