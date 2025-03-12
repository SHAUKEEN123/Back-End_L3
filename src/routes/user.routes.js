import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserProfile,
    getWatchHistory,
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
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
//.patch(): is used to update a specific part of resources
router.route("/update-account-detalis").patch(verifyJWT,updateAccountDetalis)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;