import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
    uploadImageController,
    deleteImageController,
} from "../controllers/image.controller.js";

const router = Router();

router.post(
    "/upload",
    verifyJWT,
    upload.single("image"),
    uploadImageController
);

router.delete(
    "/",
    verifyJWT,
    deleteImageController
);

export default router;