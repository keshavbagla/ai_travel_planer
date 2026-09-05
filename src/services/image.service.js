import { ApiError } from "../utils/ApiError.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";

const uploadImage = async ({ file, folder = "ai-travel-planner/images" }) => {
    if (!file) {
        throw new ApiError(400, "Image file is required.");
    }

    const response = await uploadOnCloudinary(file.path, folder);

    if (!response) {
        throw new ApiError(500, "Failed to upload image.");
    }

    return {
        url: response.secure_url,
        publicId: response.public_id,
        width: response.width,
        height: response.height,
        format: response.format,
        bytes: response.bytes,
    };
};

const deleteImage = async (publicId) => {
    if (!publicId) {
        throw new ApiError(400, "Cloudinary public ID is required.");
    }

    const response = await deleteFromCloudinary(publicId);

    if (!response) {
        throw new ApiError(500, "Failed to delete image.");
    }

    return {
        publicId,
        deleted: true,
    };
};

export {
    uploadImage,
    deleteImage,
};