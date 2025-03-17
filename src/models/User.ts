import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
   _id: Types.ObjectId; // הוספת השדה במפורש
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  location?: string;
  listings: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  location: { type: String },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
