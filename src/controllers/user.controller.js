import { asyncHandler } from "../utils/asyncHandler.js";
import { API_Error } from "../utils/API_Error.js";
import { User }  from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { API_Response } from "../utils/API_Response.js";

const registerUser = asyncHandler( async (req, res)=>{
//step1: get user details from frontend

    const {username, email, password ,fullName} = req.body
//  console.log("username", username);
//  console.log("email", email);
 
// step2:validation that fileds are not empty 
    if ([username, email, password, fullName].some((filed)=>filed?.trim()==="")) {

        throw new API_Error(400, "All fields are required")
    
    }
//step3: check if user already exists: username, email
// 1. Finding an Existing User in MongoDB

    const existedUser = await User.findOne({
        $or : [{username} , {email}]
    })
// 2. Handling Duplicate User
    if (existedUser) {
        throw new API_Error(409, "User with email or username already exists")
    }
// console.log(req.files);

//step4: check for images, check for avatar
    const avatarLocalpath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    // console.log(req.files);
    if (!avatarLocalpath) {
        throw new API_Error(400, "Avatar file is required")
    }

//step5: upload them to cloudinary, avatar  
    const avatar = await uploadOnCloudinary(avatarLocalpath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatarLocalpath) {
        throw new API_Error(400, "Avatar file is required")
    }

//step6: create user object - create entry in db
const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage:coverImage?.url || ""
})

//step:7 remove password and refresh token field from response
const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)

//step:8 check for user creation
if (!createdUser) {
    throw new API_Error(500,"Something went wrong while registering the user");
}

//step:9 return res

return res.status(201).json(
    new API_Response(200, createdUser, "User registered Successfully")
)

})

export { registerUser }