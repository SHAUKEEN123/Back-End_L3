import cloudinary from "cloudinary"
import fs from "fs"
import { API_Error } from "./API_Error.js";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        // console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteAvatarFromCloudinary = async(avatarURL)=>{
    try {
        // console.log(avatarURL)
        const publicId = avatarURL.split("/").pop().split(".")[0];
        // const result = 
        await cloudinary.uploader.destroy(publicId)

        // console.log("Cloudinary Delete Response:", result);
        // if (result.result !=="ok") {
        //     throw new API_Error(400, "")
        // }
        // return null; 
    } catch (error) {
        throw new API_Error(401, error?.message ||"avatarURL not found!...");
    }
}

const deleteCoverImageFromCloudinary = async(coverImageURL)=>{
try {
    // console.log(coverImageURL);
    
    const publicId = coverImageURL.split("/").pop().split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId)

    //  console.log("Cloudinary Delete Response:", result);
        // if (result.result !=="ok") {
        //     throw new API_Error(400, "")
        // }
        // return null; 
} catch (error) {
    throw new API_Error(401, error?.message ||"coverImageURL not found!...");
}
}

const deleteVideoFromCloudinary = async(videoURL)=>{
try {
    const publicId = videoURL.split("/").pop().split(".")[0];
    const result = await cloudinary.uploader.destroy(publicId , {resource_type:"video"})
         // if (result.result !=="ok") {
        //     throw new API_Error(400, "")
        // }
        // return null; 
} catch (error) {
    throw new API_Error(401, error?.message ||"videoURL not found!...");
}
}

export {
    uploadOnCloudinary,
    deleteAvatarFromCloudinary,
    deleteCoverImageFromCloudinary,
    deleteVideoFromCloudinary
}