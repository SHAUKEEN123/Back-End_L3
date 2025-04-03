import { Router } from "express";
import { JsonWebTokenError } from "jsonwebtoken";
import { getAllVideos } from "../controllers/video.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getAllVideos)

export default router
