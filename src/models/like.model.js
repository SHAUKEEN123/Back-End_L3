import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        vedio:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        comment:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likeBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timeseries: true}
)

export const Like = mongoose.model("Like", likeSchema)