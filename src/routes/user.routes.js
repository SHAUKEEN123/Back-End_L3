import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    login_User,
    logout_User,
    refreshAccessToken, 
    registerUser,
    updateAccountDetalis,
    updateUserAvatar,
    updateUserCoverImage,
                    } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount : 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(login_User)

// secured routes 
router.route("/logout").post(verifyJWT, logout_User)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/Change-password").post(verifyJWT,changeCurrentPassword)
router.route("/profile").post(verifyJWT,getCurrentUser)
router.route("/Account-Detalis").post(verifyJWT,updateAccountDetalis)
router.route("/update-avatar").post(upload, verifyJWT, updateUserAvatar)
router.route("/update-coverImage").post(upload, verifyJWT, updateUserCoverImage)
export default router;