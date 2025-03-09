import { User } from "../models/user.model.js";
import { API_Error } from "../utils/API_Error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req, _, next)=>{
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    // console.log(token);
    if (!token) {
        throw new API_Error(401,"unauthorized request");
    }

    const decodedTookenInformation = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)    

    const user = await User.findById(decodedTookenInformation?._id).select("-password -refreshToken")

    if (!user) {
        throw new API_Error(401, "Invalid Access Token")
    }
    req.user = user

    next()

} catch (error) {
    throw new API_Error(401, error?.message || "Invaild access token");   
}
})