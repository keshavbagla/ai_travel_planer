import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "./ApiError.js";

const uploadOnCloudinary = async(localFilePath, folder= "ai-travel-planner") => 
{
  try{
    if(!localFilePath){
      return null;
    }

    const response = await cloudinary.uploader.upload(
      localFilePath,
      {
        folder,
        resource_type: "auto",
      }
    );

    fs.unlinkSync(localFilePath);

    return response;
  }

  catch(error){
    if(localFilePath && fs.existsSync(localFilePath)){
      fs.unlinkSync(localFilePath);
    }

    throw new ApiError(500, "Failed to upload file to Cloudinary");
  }
};

const deleteFromCloudinary = async(publicId) => {
  if(!publicId){
    return;
  }

  try{
    return await cloudinary.uploader.destroy(publicId);
  }

  catch(error){
    throw new ApiError(500, "Failed to delete file from Cloudinary");
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };