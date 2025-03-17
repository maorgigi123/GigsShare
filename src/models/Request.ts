import mongoose, { Document, Schema } from "mongoose";

export interface IRequest extends Document {
  listing: mongoose.Types.ObjectId;
  renter: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  rentalDate: Date;
  returnDate: Date;
  createdAt: Date;
}

const RequestSchema = new Schema<IRequest>({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  rentalDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Request = mongoose.model<IRequest>("Request", RequestSchema);
export default Request;
