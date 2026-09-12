import {
    searchGooglePlaces,
    getGooglePlaceDetails,
    getGooglePlacePhoto,
} from "../services/googlePlaces.service.js";

const searchPlaces = async (
    req,
    res
) => {

    const {
        query,
        latitude,
        longitude,
        radius,
        maxResultCount,
    } = req.body;


    const data =
        await searchGooglePlaces({
            query,
            latitude,
            longitude,
            radius,
            maxResultCount,
        });


    return res.status(200).json({
        success: true,

        statusCode: 200,

        message:
            "Places fetched successfully from Google.",

        data,
    });
};

const getPlaceDetails = async (
    req,
    res
) => {

    const {
        placeId,
    } = req.params;


    const data =
        await getGooglePlaceDetails(
            placeId
        );


    return res.status(200).json({
        success: true,

        statusCode: 200,

        message:
            "Place details fetched successfully from Google.",

        data,
    });
};

const getPlacePhoto = async (
    req,
    res
) => {

    const {
        photoResourceName,
    } = req.body;


    const {
        maxWidthPx,
        maxHeightPx,
    } = req.body;


    const data =
        await getGooglePlacePhoto({
            photoResourceName,

            maxWidthPx,

            maxHeightPx,
        });


    return res.status(200).json({
        success: true,

        statusCode: 200,

        message:
            "Place photo fetched successfully from Google.",

        data,
    });
};


export {
    searchPlaces,
    getPlaceDetails,
    getPlacePhoto,
};