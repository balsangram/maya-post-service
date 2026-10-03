import { Schema, model, type Document } from "mongoose";

export interface IAdvertisement extends Document {
    advImg: string;
    advImgPublicId: string;
    }   

const advertisementSchema = new Schema<IAdvertisement>(
{
  advImg:{
    type : String,
    required : true,
  },
    advImgPublicId: {
      type: String,
      required: true,
    },
},{
    timestamps : true
  }
)
export default model<IAdvertisement>("Advertisement", advertisementSchema);