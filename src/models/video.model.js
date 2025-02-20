import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema= new Schema(
    {
        videoFile:{
            type: String, //from cloudnary url 
            required : true
        },
        thumbnail : {
            type: String, //from cloudnary url 
            required : true
        },
        title: {
            type : String,
            required: true
        },
        Description: {
            type : String,
            required: true
        },
        duration: {
            type : Number,
            required: true
        },
        views:{
            type: Number,
            default : 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        }
    },

    {
    timeseries:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);