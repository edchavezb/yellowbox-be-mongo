import { model, Document } from "mongoose";
import { UserSchema } from "../types/schemas";
import { UserAccountData, UserBilling } from "../types/interfaces";

interface IUser extends Document {
    firebaseId: string,
    username: string
    displayName: string
    image: string
    account: UserAccountData
    billing: UserBilling
    services: {
        [key: string]: {
            refreshToken: string
            id: string
        }
    },
    dashboardFolders: string[],
    dashboardBoxes: string[]
}

const UserModel = model<IUser>("User", UserSchema);

export { UserModel, IUser };
