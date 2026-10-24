import mongoose, {
  type Document,
  type Model,
  Schema,
  Types,
} from "mongoose";

/* =========================
   Media
========================= */

export interface IMedia {
  url: string;
  mediaId: string;
}

/* =========================
   Like
========================= */

export interface IPostLike {
  userId: Types.ObjectId;
  createdAt: Date;
}

/* =========================
   Comment
========================= */

export interface IPostComment {
  userId: Types.ObjectId;
  comment: string;
  createdAt: Date;
}

/* =========================
   Post
========================= */

export interface IPostLocation {
  type: "Point";
  coordinates: number[];
  pin?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface IPost {
  userId: Types.ObjectId;

  description: string;
  locationLink: string;
  location?: IPostLocation;

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

  likes: IPostLike[];
  comments: IPostComment[];

  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPostDocument extends IPost, Document {}

/* =========================
   Media Schema
========================= */

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

/* =========================
   Like Schema
========================= */

const likeSchema = new Schema<IPostLike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/* =========================
   Comment Schema
========================= */

const commentSchema = new Schema<IPostComment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

/* =========================
   Post Schema
========================= */

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

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
      pin: {
        type: String,
        default: "",
        trim: true,
      },
      district: {
        type: String,
        default: "",
        trim: true,
      },
      city: {
        type: String,
        default: "",
        trim: true,
      },
      state: {
        type: String,
        default: "",
        trim: true,
      },
      country: {
        type: String,
        default: "",
        trim: true,
      },
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

    likes: {
      type: [likeSchema],
      default: [],
    },

    comments: {
      type: [commentSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

postSchema.index({ location: "2dsphere" });

const Post: Model<IPostDocument> =
  mongoose.model<IPostDocument>("Post", postSchema);

export default Post;