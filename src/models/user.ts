import { model, Document } from "mongoose";
import { UserSchema } from "../types/schemas";

interface IUser extends Document {
    displayName: string
    image: string
    email: string
    services: {
        [key: string]: string
    }
}

const UserModel = model<IUser>("User", UserSchema);

export { UserModel, IUser };
