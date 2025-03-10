import { asyncHandler } from "../utils/asyncHandler.js";
import { API_Error } from "../utils/API_Error.js";
import { User }  from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { API_Response } from "../utils/API_Response.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId)=>{
try {
const user = await User.findOne(userId)
 const accessToken = user.generateAccessToken()
 const refreshToken = user.generateRefreshToken()
//  store refresh token in db 
user.refreshToken = refreshToken
await user.save({validateBeforeSave: false})

return {accessToken, refreshToken}

} catch (error) {
    throw new API_Error(500, "Something went wrong while generating referesh and access token")
}
}


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

// Algorithm for Login user
// req.body--> data (username, email, password)
// find user in db with usermane or email 
// password metching
// generate access and refresh token 
// store refresh token in db 
// send cookies to user 
// send response 

const login_User = asyncHandler( async (req, res)=>{
// req.body--> data (username, email, password)
const {username, email, password} = req.body
// console.log(email);


if (!username && !email) {
    throw new API_Error(400,"username or email is required");
}
// this is alternative of above code 
// if (!(username || email)) {
//     throw new API_Error(400,"username or email is required");
// }

// find user in db with usermane or email 
const user = await User.findOne({
    $or: [{username},{email}]
})

if (!user) {
    // throw new API_Error(404,`user with ${username} or ${email} Does't Exist`);
    throw new API_Error(404,"user does not exist");
}
// console.log(password);

// password metching
const isPasswordValid = await user.isPasswordCorrect(password)

if (!isPasswordValid) {
    throw new API_Error(401,"Invalid password");
}

// generate access and refresh token 
const {accessToken , refreshToken} = await generateAccessAndRefereshTokens(user._id)
// user.accessToken = accessToken
// user.refreshToken = refreshToken

const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

// send cookies to user 
// send response 

const options = {
    httpOnly: true,
    secure: true
}
return res
.status(200)
.cookie("accessToken", accessToken, options)
.cookie("refreshToken", refreshToken, options)
.json(
    new API_Response(
        200,
        {
            // user: accessToken, refreshToken , loggedInUser
            accessToken, refreshToken , loggedInUser
        },
        "User loggedIn Successfully"
    )
)

})

// Algorithm for Logout user 
// user authentication ->valid token exists or not 
// remove refresh token from user model to properlly logout user 
// clear cookies 
// send response 
const logout_User = asyncHandler( async(req, res)=>{
   User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken: 1 // this removes the field from document /user docs
        }
    },
    {
        new : true
    }
)

// clear cookies 
// send response 

const options = {
    httpOnly : true,
    secure: true
}
return res
.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(
    new API_Response(
        200,
        {},
        "User Logout Successfully"
    )
)

})

//refresh accessToken 
const refreshAccessToken = asyncHandler( async(req, res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new API_Error(401, "unauthorized request")
    }

    try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)    
 
    const user = await User.findById(decodedToken?._id)
 
     
    if (!user) {
        throw new API_Error(401, "Invalid refreshToken")
    }
 
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new API_Error(401,"Refresh token is expired or used");
    }
    const {accessToken , newRefreshToken} = await generateAccessAndRefereshTokens(user._id)

    const options = {
        httpOnly : true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new API_Response(
            200,
            {
                accessToken, refreshToken : newRefreshToken, 
            },
            "Access token refreshed Succsessfully"
         )
     )
   } catch (error) {
    throw new API_Error(401,error?.message || "Refresh Token Invalid");
   }

})

//change current password 
const changeCurrentPassword = asyncHandler(async(req, res)=>{
    //destructuring password on frontend 
    const {Old_Password, New_Password} = req.body   //the request body actually contains oldPassword and newPassword when sent from the frontend or API client (e.g., Postman). 

    // access user with req.user = user 
    const user = await User.findById(req.user?._id)
    
    // varify Old_Password and user'database password 
    const isPasswordCorrect = await user.isPasswordCorrect(Old_Password)

    if (!isPasswordCorrect) {
        throw new API_Error(400,"Invaild Old password");
    }

    user.password = New_Password
    user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new API_Response(
            200, 
            {},
            "Password change successfully"
        )
    )
})

// if click on profile than get current user to change account and images 
const getCurrentUser = asyncHandler(async()=>{
    return res
    .status(200)
    .json(
        new API_Response(
            200,
            req.user,
            "User fetched Successfully"
        )
    )
})

// modify account detalis 
const updateAccountDetalis = asyncHandler(async(req, res)=>{
    const {email, fullName} = req.body
    if (!email || !fullName) {
        throw new API_Error(400,"All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
                email: email
                // second version of above code 
                // fullName, 
                // email
            },
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            // updated user retrun
            user,
            "Account details updated successfully"
        )
    )

})

// modify images 
const updateUserAvatar = asyncHandler(async(req, res)=>{
// with the help of multer middleware access files ,if access one file use req.file only 
    const avatarLocalpath = req.file?.path

    if (!avatarLocalpath) {
        throw new API_Error(400,"avatar file is requried");
    }

    const avatar = await uploadOnCloudinary(avatarLocalpath)

    if (!avatar.url) {
        throw new API_Error(400,"Error while uploading on avatar");
        
    }
    const user = User.findByIdAndUpdate(
        // with the help of auth middleware we access user 
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            user,
            "Avatar image updated successfully"
    )
)

})

const  updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new API_Error(400, "cover image file is requried");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new API_Error(400,"Error while uploading on cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new API_Response(
            200,
            user,
            "cover image updated successfully"
        )
    )
})


export { 
    registerUser,
    login_User,
    logout_User,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetalis,
    updateUserAvatar,
    updateUserCoverImage
 }