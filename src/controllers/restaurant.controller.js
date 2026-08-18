import { restaurantService } from "../services/restaurant.service.js";
import {
    validateCreateRestaurant,
    validateUpdateRestaurant,
    validateRestaurantId,
} from "../validators/restaurant.validator.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
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

const createRestaurant = asyncHandler(async (req, res) => {
    req.body.location =
        parseJSONField(req.body.location);
    req.body.cuisine =
        parseJSONField(req.body.cuisine);
    req.body.amenities =
        parseJSONField(req.body.amenities);
    req.body.dietaryOptions =
        parseJSONField(req.body.dietaryOptions);
    req.body.openingHours =
        parseJSONField(req.body.openingHours);
    req.body.menu =
        parseJSONField(req.body.menu);

    validateCreateRestaurant(req.body);

    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const restaurant =
        await restaurantService.createRestaurant({
            restaurantData:
                req.body,
            coverImage,
            galleryImages,
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            restaurant,
            "Restaurant created successfully."
        )
    );
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants =
        await restaurantService.getAllRestaurants(
            req.query
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            restaurants,
            "Restaurants fetched successfully."
        )
    );
});

const getRestaurantById = asyncHandler(async (req, res) => {
    const { restaurantId } =
        req.params;

    validateRestaurantId(
        restaurantId
    );

    const restaurant =
        await restaurantService.getRestaurantById(
            restaurantId
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            restaurant,
            "Restaurant fetched successfully."
        )
    );
});

const searchRestaurants = asyncHandler(async (req, res) => {
    const restaurants =
        await restaurantService.searchRestaurants(
            req.query.keyword
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            restaurants,
            "Search completed successfully."
        )
    );
});


const saveExternalRestaurant =
    asyncHandler(async (req, res) => {
        const restaurant =
            await restaurantService
                .saveExternalRestaurant({
                    restaurantData: req.body,
                });

        return res.status(200).json(
            new ApiResponse(
                200,
                restaurant,
                "Restaurant selected successfully."
            )
        );
});

const filterRestaurants = asyncHandler(async (req, res) => {
    const restaurants =
        await restaurantService.filterRestaurants(
            req.query
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            restaurants,
            "Restaurants filtered successfully."
        )
    );
});

const updateRestaurant = asyncHandler(async (req, res) => {
    if(req.body.location){
      req.body.location =
          parseJSONField(req.body.location);
    }
    if(req.body.cuisine){
      req.body.cuisine =
          parseJSONField(req.body.cuisine);
    }
    if(req.body.amenities){
      req.body.amenities =
          parseJSONField(req.body.amenities);
    }
    if(req.body.dietaryOptions){
      req.body.dietaryOptions =
          parseJSONField(req.body.dietaryOptions);
    }
    if(req.body.openingHours){
      req.body.openingHours =
          parseJSONField(req.body.openingHours);
    }
    if(req.body.menu){
      req.body.menu =
          parseJSONField(req.body.menu);
    }
    
    const { restaurantId } =
        req.params;

    validateRestaurantId(
        restaurantId
    );

    validateUpdateRestaurant(
        req.body
    );

    const coverImage =
        req.files?.coverImage?.[0];

    const galleryImages =
        req.files?.galleryImages || [];

    const restaurant =
        await restaurantService.updateRestaurant({
            restaurantId,
            restaurantData:
                req.body,
            coverImage,
            galleryImages,
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            restaurant,
            "Restaurant updated successfully."
        )
    );
});

const deleteRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } =
        req.params;

    validateRestaurantId(
        restaurantId
    );

    await restaurantService.deleteRestaurant(
        restaurantId
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Restaurant deleted successfully."
        )
    );
});

export {
    createRestaurant,
    getAllRestaurants,
    getRestaurantById,
    searchRestaurants,
    filterRestaurants,
    updateRestaurant,
    deleteRestaurant,
};