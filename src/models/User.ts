import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
   _id: Types.ObjectId; // הוספת השדה במפורש
  username: string;
  email: string;
  password: string;
  phone?: string;
  avatar?: string;
  location: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
}

  listings: mongoose.Types.ObjectId[];
  fcmToken?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  listings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Listing" }],
  fcmToken: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
