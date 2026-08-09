import { activityService } from "../services/activity.service.js";
import {
    validateCreateActivity,
    validateUpdateActivity,
    validateActivityId,
} from "../validators/activity.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const parseJSONField = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    }
    catch {
        return value;
    }
};

const createActivity = asyncHandler(async (req, res) => {
    req.body.location =
        parseJSONField(req.body.location);
    req.body.schedule =
        parseJSONField(req.body.schedule);
    req.body.included =
        parseJSONField(req.body.included);
    req.body.excluded =
        parseJSONField(req.body.excluded);
    req.body.languages =
        parseJSONField(req.body.languages);

    validateCreateActivity(req.body);

    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const activity =
        await activityService.createActivity({
            activityData:
                req.body,
            coverImage,
            galleryImages,
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            activity,
            "Activity created successfully."
        )
    );
});

const getAllActivities = asyncHandler(async (req, res) => {
    const activities =
        await activityService.getAllActivities(
            req.query
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            activities,
            "Activities fetched successfully."
        )
    );
});

const getActivityById = asyncHandler(async (req, res) => {
    const { activityId } =
        req.params;

    validateActivityId(
        activityId
    );

    const activity =
        await activityService.getActivityById(
            activityId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            activity,
            "Activity fetched successfully."
        )
    );
});

// Search Activities

const searchActivities = asyncHandler(async (req, res) => {
    const activities =
        await activityService.searchActivities(
            req.query.keyword
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            activities,
            "Search completed successfully."
        )
    );
});

// Filter Activities

const filterActivities = asyncHandler(async (req, res) => {
    const activities =
        await activityService.filterActivities(
            req.query
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            activities,
            "Activities filtered successfully."
        )
    );
});

// Update Activity

const updateActivity = asyncHandler(async (req, res) => {
    if(req.body.location){
      req.body.location =
          parseJSONField(req.body.location);
    }
    if(req.body.schedule){
      req.body.schedule =
          parseJSONField(req.body.schedule);
    }
    if(req.body.included){
      req.body.included =
          parseJSONField(req.body.included);
    }
    if(req.body.excluded){
      req.body.excluded =
          parseJSONField(req.body.excluded);
    }
    if(req.body.languages){
      req.body.languages =
          parseJSONField(req.body.languages);
    }

    const { activityId } =
        req.params;

    validateActivityId(
        activityId
    );

    validateUpdateActivity(
        req.body
    );

    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const activity =
        await activityService.updateActivity({
            activityId,
            activityData:
                req.body,
            coverImage,
            galleryImages,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            activity,
            "Activity updated successfully."
        )
    );
});

// Delete Activity

const deleteActivity = asyncHandler(async (req, res) => {
    const { activityId } =
        req.params;

    validateActivityId(
        activityId
    );

    await activityService.deleteActivity(
        activityId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Activity deleted successfully."
        )
    );
});

export {
    createActivity,
    getAllActivities,
    getActivityById,
    searchActivities,
    filterActivities,
    updateActivity,
    deleteActivity,
};