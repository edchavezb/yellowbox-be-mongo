import { model, Document } from "mongoose";
import { FolderSchema } from "../types/schemas";

interface IUserFolder extends Document {
    name: boolean,
    public: boolean,
    isDeletedByUser?: boolean,
    creator: string
    description: string,
    boxes: {
        boxId: string,
        boxName: string
    }[]
}

const FolderModel = model<IUserFolder>("Folder", FolderSchema);

export { FolderModel, IUserFolder };
