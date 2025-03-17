import mongoose, { Document, Schema } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  owner: mongoose.Types.ObjectId;
  available: boolean;
  location?: string;
  createdAt: Date;
}

const ListingSchema = new Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  available: { type: Boolean, default: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Listing = mongoose.model<IListing>("Listing", ListingSchema);
export default Listing;
