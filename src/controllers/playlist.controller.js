import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { API_Error } from "../utils/API_Error.js";
import { API_Response } from "../utils/API_Response";
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const {name, description} = req.body

    if (!name || !description) {
        throw new API_Error(400, "Name and Description are requierd");
    }

    const playlist = new Playlist({
        name,
        description,
        userId: req.user?._id
    })

    const updatedPlaylist = await playlist.save()
    
    return res
    .status(200)
    .json(
        new API_Response(
            200,
            updatedPlaylist,
            "Playlist created successfully."
        )
    )
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new API_Error(400,"Invalid User Id");
    }

    // const playlist = await Playlist.findById({userId});
    const playlist = await Playlist.findById(userId);

    if (!playlist || playlist.length === 0 ) {
        throw new API_Error(404, "Playlist not found of current user");
    }

return res
.status(200)
.json(
    new API_Response(
        200,
        playlist,
        "Playlist for user retrieved successfully"
    )
)

});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new API_Error(400, "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new API_Error(404, "playlist not found");
    }  

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            playlist,
            "playlist Found!"
        )
    )
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new API_Error(400, "invalid playlist ID");
    }

    const playlist = await Playlist.findOneAndDelete({_id : playlistId});

    if (!playlist) {
        throw new API_Error(404, "Playlist not found!");
    }

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            "Playlist was deleted"
        )
    )
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new API_Error(400, "invalid playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new API_Error(404,"playlist not found!");
    }

    if (name || description) {
        playlist.name = name;
        playlist.description = description;
    }

    const updatedPlaylist = await playlist.save()

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            updatedPlaylist,
            "playlist updated successfully"
        )
    )
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!isValidObjectId(playlistId)) {
        throw new API_Error(400, "invalid playlist id");
    }

    if (!isValidObjectId(videoId)) {
        throw new API_Error(400, "invalid video Id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (playlist.videos.include(videoId)) {
        throw new API_Error("video already exist in playlist");
    }

    playlist.videos.push(videoId);

    const updatedPlaylist = await playlist.save();

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            updatedPlaylist,
            "Video added successfully"
        )
    )

});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // 🔹 Validate playlistId and videoId
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new API_Error(400, "Invalid playlist or video ID");
    }

    // 🔹 Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new API_Error(404, "Playlist not found");
    }

    // 🔹 Find the video index safely
    const videoIndex = playlist.videos.findIndex(
        (_id) => _id.toString() === videoId
    );

    if (videoIndex === -1) {
        throw new API_Error(404, "Video not found in the playlist");
    }

    // 🔹 Remove the video safely
    playlist.videos.splice(videoIndex, 1);
    const updatedPlaylist = await playlist.save();

    // 🔹 Send success response
    res.status(200).json(
        new API_Response(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    deletePlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}