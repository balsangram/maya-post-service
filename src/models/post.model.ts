import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

// ==============================
// Media Type
// ==============================

export interface IMedia {
  url: string;
  mediaId: string;
}

// ==============================
// Post Type
// ==============================

export interface IPost {
  userId: Types.ObjectId;

  description: string;

  locationLink: string;

  food: "veg" | "nonveg" | "all";

  maritalStatus: "married" | "unmarried" | "all";

  profession: "job" | "student" | "all";

  religion:
    | "hindu"
    | "christian"
    | "muslim"
    | "sikh"
    | "buddhist"
    | "jain"
    | "other"
    | "all";

  genderPreference: "girl" | "boy" | "both";

  minAge: number;

  maxAge: number;

  problems: string[];

  images: IMedia[];

  videos: IMedia[];

  isActive: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}

// ==============================
// Post Document
// ==============================

export interface IPostDocument extends IPost, Document {}

// ==============================
// Media Schema
// ==============================

const mediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },

    mediaId: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

// ==============================
// Post Schema
// ==============================

const postSchema = new Schema<IPostDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    locationLink: {
      type: String,
      default: "",
      trim: true,
    },

    food: {
      type: String,
      enum: ["veg", "nonveg", "all"],
      default: "all",
    },

    maritalStatus: {
      type: String,
      enum: ["married", "unmarried", "all"],
      default: "all",
    },

    profession: {
      type: String,
      enum: ["job", "student", "all"],
      default: "all",
    },

    religion: {
      type: String,
      enum: [
        "hindu",
        "christian",
        "muslim",
        "sikh",
        "buddhist",
        "jain",
        "other",
        "all",
      ],
      default: "all",
    },

    genderPreference: {
      type: String,
      enum: ["girl", "boy", "both"],
      default: "both",
    },

    minAge: {
      type: Number,
      min: 18,
      max: 100,
      default: 18,
    },

    maxAge: {
      type: Number,
      min: 18,
      max: 100,
      default: 100,
    },

    problems: {
      type: [String],
      default: [],
    },

    images: {
      type: [mediaSchema],
      default: [],
    },

    videos: {
      type: [mediaSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==============================
// Model
// ==============================

const Post: Model<IPostDocument> = mongoose.model<
  IPostDocument
>("Post", postSchema);

export default Post;