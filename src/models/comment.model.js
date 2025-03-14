import mongoose, { plugin, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        vedio:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {timeseries: true}
)

commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment" ,commentSchema)