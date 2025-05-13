import mongoose, { Document, Schema } from "mongoose";

export interface IAvailability {
  [day: string]: {
    from: Date | null;
    to: Date | null;
  };
}

export interface ICancellationPolicy {
  type: "flexible" | "moderate" | "strict" | "custom";
  text?: string;
}

export interface IDamagePolicy {
  requiresAgreement: boolean;
  depositAmount: number;
  policyText?: string;
}

export interface ILocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  fullAddress?: string;
}

export interface ILogistics {
  address: ILocation;
  method: "pickup" | "delivery";
  deliveryPrice: number;
}

export interface IListing extends Document {
  title: string;
  description: string;
  categories: string[];
  pricePerHour: number;
  images: string[];
  owner: mongoose.Types.ObjectId;
  available: boolean;
  availability?: IAvailability;
  cancellationPolicy?: ICancellationPolicy;
  damagePolicy?: IDamagePolicy;
  logistics?: ILogistics;
  createdAt: Date;
  updatedAt: Date;
}

const LogisticsAddressSchema = new Schema<ILocation>(
  {
    city: { type: String, required: true },
    country: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    fullAddress: { type: String },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    categories: [{ type: Number, required: true }],
    pricePerHour: { type: Number, required: true },
    images: [{ type: {}, required: true }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    available: { type: Boolean, default: true },

    availability: {
      type: Map,
      of: new Schema(
        {
          from: { type: Date, default: null },
          to: { type: Date, default: null },
        },
        { _id: false }
      ),
      default: {},
    },

    cancellationPolicy: {
      type: {
        type: String,
        enum: ["flexible", "moderate", "strict", "custom"],
      },
      text: { type: String },
    },

    damagePolicy: {
      requiresAgreement: { type: Boolean, default: false },
      depositAmount: { type: Number, default: 0 },
      policyText: { type: String },
    },

    logistics: {
      address: { type: LogisticsAddressSchema, required: true },
      method: { type: String, enum: ["pickup", "delivery"], required: true },
      deliveryPrice: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model<IListing>("Listing", ListingSchema);
export default Listing;
