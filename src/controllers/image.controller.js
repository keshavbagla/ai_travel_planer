import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    uploadImage,
    deleteImage,
} from "../services/image.service.js";

const uploadImageController = asyncHandler(async (req, res) => {
    const { folder } = req.body;

    const image = await uploadImage({
        file: req.file,
        folder: folder || "ai-travel-planner/images",
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            image,
            "Image uploaded successfully."
        )
    );
});

const deleteImageController = asyncHandler(async (req, res) => {
    const { publicId } = req.body;

    const result = await deleteImage(publicId);

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Image deleted successfully."
        )
    );
});

export {
    uploadImageController,
    deleteImageController,
};