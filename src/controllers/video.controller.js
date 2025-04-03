import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { isValidObjectId } from "mongoose";
import { API_Response } from "../utils/API_Response.js";
import { API_Error } from "../utils/API_Error.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// algo for Get all videos with query, sorting, and pagination.
// Extract query parameters from the request: page,query,sortby,sorttype,userid
const getAllVideos = asyncHandler(async(req, res)=>{
const {page = 1,limit= 10, query, sortBy, sortType, userId } = req.query()
// Convert page and limit to numbers
const pageNumber = parseInt(page);
const pageLimit = parseInt(limit);

// Initialize search conditions
let searchConditions = {};
// Add search conditions for query (title/description)
if (query) {
    searchConditions.$or = [
        { title: { $regex: query, $options: "i" } },
        {description: {$regex : query, $options: "i"}}
    ];
}

// Filter by userId (if provided and valid)
if (userId && isValidObjectId(userId)) {
    searchConditions.userId = userId
}

// Set sorting order
const sortOrder = sortType=="asc"? 1 : -1;

// fetch paginated and sorted videos 
const video = await Video.find(searchConditions)
.sort({[sortBy]: sortOrder})
.skip((pageNumber-1)*pageLimit) //skip previous pages
.limit(pageLimit);

// Get total number of matching videos
const totalVideos = await Video.countDocuments(searchConditions)

// Calculate total pages
const totalPages = Math.ceil(totalVideos/pageLimit)

// send response 
return res
.status(200)
.json(
    new API_Response(
        // aggrigation pipeline 
        {
            success: true,
            Message: "Videos retrived Successfully",
            data: video,

            pagination: {
                page: pageNumber,
                limit: pageLimit,
                totalPages,
                totalVideos,
                },
        }
    )
)


});

const publishAVideo = asyncHandler(async(req, res)=>{
const {title, description} = req.body()
// validation requied files 
if (!title || !description || req.files || !req.files.video) {
    throw new API_Error(400, "Title, description, and video file are required.");
}

// Extract the uploaded video file
const videoFile = req.files?.video;

// Upload the video to Cloudinary
try {
    const uploadResponse = await uploadOnCloudinary(videoFile?.path)
    
    // Retrieve videoUrl and thumbnailUrl
    const videoUrl = uploadResponse.secure_url;
    const thumbnailUrl = uploadResponse.thumbnail_url || "";
    
    // Save the video details in the database
    const newVideo = await Video.create({
        title,
        description,
        videoUrl,
        thumbnail: thumbnailUrl,
        userId: req.user?._id,
        publishStatus: false,
    });
    
    return res
    .status(201)
    .json(
        new API_Response(
            201,
            newVideo,
            "video published successfully",
        )
    )
} catch (error) {
    throw new API_Error(error?.message || "failed to publish, video please try again later ");
}
});

const getVideoById = asyncHandler(async(req, res)=>{
const {videoId} = req.prams;

// Validate if videoId is a valid MongoDB ObjectId
if (!isValidObjectId(videoId)) {
    throw new API_Error(400,"Vedio id formet Incorect");
}

// Find video by ID
const video = await Video.findById(videoId)

if (!video) {
    throw new API_Error(404,"Video not found");
}

if (req.user?._id !== video?.userId.toString()) {
    throw new API_Error(403,"You are not authorized to view this video.");
}

return res
.status(200)
.json(
    new API_Response(
        200,
        video,
        "Video retrieved successfully."
    )
)
});

const updateVideo = asyncHandler(async(req, res)=>{
const {videoId} = req.prams;

// Extract the fields to update from request body
const {title, description ,thumbnail} = req.body 

// validate vedioId
if (!isValidObjectId(videoId)) {
    throw new API_Error(400, "Invalid video ID format.");
}

// Find video in the database
const video = await Video.findById(videoId);

if (!video) {
    throw new API_Error(404, "Video not found.");
}

// Check if the logged-in user is authorized to update the video
if (req.user?._id !== video.userId.toString()) {
    throw new API_Error(400, "You are not authorized to update this video.");
}

// Update only the fields that are provided

if (title || description || thumbnail) {
    video.title = title,
    video.description = description,
    video.thumbnail = thumbnail
}

const updatedVideo = await video.save();

return res
.status(200)
.json(
    new API_Response(
        200,
        updatedVideo,
        "Video details updated successfully."
    )
)

});

const deleteVideo = asyncHandler(async (req, res) => {
const { videoId } = req.params;
// const videoFile = req.files?.video;
// Validate if videoId is a valid MongoDB ObjectId
if (!isValidObjectId(videoId)) {
    throw new API_Error(400, "Invalid video ID format.");
}
    
// Find the video by ID
const video = await Video.findById(videoId);
    
// If video is not found, return a 404 error
if (!video) {
throw new API_Error(404, "Video not found.");
}
    
// Check if the logged-in user is authorized to delete the video
if (req.user?._id !== video.userId.toString()) {
    throw new API_Error(400, "You are not authorized to delete this video.");
}

if (video) {
    await deleteVideoFromCloudinary(video?.videoUrl)
}

// delete from db
await video.deleteOne();

return res.status(200)
.json(
    new API_Response(
        200,
        "Video delete Successfully!"
    )
)

});

const togglePublishStatus = asyncHandler(async(req,res)=>{
const {videoId} = req.prams;

if (!isValidObjectId(videoId)) {
    throw new API_Error(400, "Invalid video ID format");
}

const video = await Video.findById(videoId);

if (!video) {
    throw new API_Error(404, "Video not found");
}

if (req.user?._id !== video.userId.toString()) {
    throw new API_Error(400, "You are not authorized to modify this video");
}

// Toggle publish status
video.isPublished = !video.isPublished;

await video.save(); 
return res
.status(200)
.json(
    new API_Response(
        200,
        `Video ${video.publishStatus ? "published" : "unpublished"} successfully`
    )
)
})
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}