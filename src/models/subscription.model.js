import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber: { //follower
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        channel : { //channel owner
            type : Schema.Types.ObjectId,
            ref : "User"
        }
}, {timeseries:true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema)