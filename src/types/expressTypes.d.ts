import { IUser } from "../models/user";
import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}