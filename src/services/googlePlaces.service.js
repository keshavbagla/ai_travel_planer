import { ApiError } from "../utils/ApiError.js";

import {
    GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACES_BASE_URL,
} from "../config/googlePlaces.js";

const MAX_SEARCH_RESULTS = 20;
const MAX_PHOTOS = 10;

const getApiHeaders = (fieldMask) => {

    if (!GOOGLE_PLACES_API_KEY) {
        throw new ApiError(
            500,
            "GOOGLE_PLACES_API_KEY is not configured."
        );
    }

    return {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": fieldMask,
    };
};

const handleGoogleApiError = async (
    response,
    operation
) => {

    const errorBody =
        await response.text();

    console.error(
        `Google Places ${operation} API error:`,
        {
            status: response.status,
            statusText: response.statusText,
            body: errorBody,
        }
    );

    if (response.status === 400) {
        throw new ApiError(
            400,
            `Invalid Google Places ${operation} request.`
        );
    }

    if (response.status === 401) {
        throw new ApiError(
            401,
            "Google Places API key is invalid."
        );
    }

    if (response.status === 403) {
        throw new ApiError(
            403,
            "Google Places API access is not authorized."
        );
    }

    if (response.status === 404) {
        throw new ApiError(
            404,
            "Google place resource not found."
        );
    }

    if (response.status === 429) {
        throw new ApiError(
            503,
            "Google Places API quota exceeded."
        );
    }

    throw new ApiError(
        502,
        `Unable to fetch data from Google Places during ${operation}.`
    );
};

const normalizePhoto = (photo) => {
    return {
        resourceName: photo.name || null,
        width: photo.widthPx ?? null,
        height: photo.heightPx ?? null,
        authorAttributions: photo.authorAttributions || [],
        googleMapsUri: photo.googleMapsUri || null,

        // Temporary debugging
        raw: photo,
    };
};

const normalizePlace = (
    place
) => {

    return {
        placeId:
            place.id || null,

        resourceName:
            place.name || null,

        displayName:
            place.displayName?.text ||
            null,

        languageCode:
            place.displayName?.languageCode ||
            null,

        formattedAddress:
            place.formattedAddress ||
            null,

        shortFormattedAddress:
            place.shortFormattedAddress ||
            null,

        latitude:
            place.location?.latitude ??
            null,

        longitude:
            place.location?.longitude ??
            null,

        primaryType:
            place.primaryType ||
            null,

        types:
            place.types ||
            [],

        websiteUri:
            place.websiteUri ||
            null,

        nationalPhoneNumber:
            place.nationalPhoneNumber ||
            null,

        internationalPhoneNumber:
            place.internationalPhoneNumber ||
            null,

        rating:
            place.rating ??
            null,

        userRatingCount:
            place.userRatingCount ??
            null,

        priceLevel:
            place.priceLevel ||
            null,

        googleMapsUri:
            place.googleMapsUri ||
            null,

        photos:
            (place.photos || [])
                .slice(0, MAX_PHOTOS)
                .map(normalizePhoto),

        editorialSummary:
            place.editorialSummary?.text ||
            null,

        source:
            "Google Places",
    };
};

const searchGooglePlaces = async ({
    query,
    latitude,
    longitude,
    radius = 10000,
    maxResultCount = 10,
}) => {

    if (!query?.trim()) {
        throw new ApiError(
            400,
            "Place search query is required."
        );
    }

    const safeLimit =
        Math.min(
            Math.max(
                Number(maxResultCount) || 10,
                1
            ),
            MAX_SEARCH_RESULTS
        );

    const body = {
        textQuery: query.trim(),
        maxResultCount: safeLimit,
    };


    /*
     * Location bias is optional.
     *
     * We only add it when valid coordinates
     * are supplied.
     */

    if (
        latitude !== undefined &&
        longitude !== undefined
    ) {

        const safeRadius =
            Math.min(
                Math.max(
                    Number(radius) || 10000,
                    1
                ),
                50000
            );

        body.locationBias = {
            circle: {
                center: {
                    latitude:
                        Number(latitude),

                    longitude:
                        Number(longitude),
                },

                radius:
                    safeRadius,
            },
        };
    }


    const fieldMask = [
        "places.id",
        "places.name",
        "places.displayName",
        "places.formattedAddress",
        "places.shortFormattedAddress",
        "places.location",
        "places.primaryType",
        "places.types",
        "places.websiteUri",
        "places.nationalPhoneNumber",
        "places.internationalPhoneNumber",
        "places.rating",
        "places.userRatingCount",
        "places.priceLevel",
        "places.googleMapsUri",
        "places.photos",
        "places.editorialSummary",
    ].join(",");


    let response;

    try {

        response = await fetch(
            `${GOOGLE_PLACES_BASE_URL}/places:searchText`,
            {
                method: "POST",

                headers:
                    getApiHeaders(
                        fieldMask
                    ),

                body:
                    JSON.stringify(body),
            }
        );

    } catch (error) {

        console.error(
            "Google Places search network error:",
            error.message
        );

        throw new ApiError(
            503,
            "Unable to connect to Google Places."
        );
    }


    if (!response.ok) {
        await handleGoogleApiError(
            response,
            "search"
        );
    }


    const data =
        await response.json();


    const places =
        (data.places || [])
            .map(normalizePlace);


    return {
        query:
            query.trim(),

        count:
            places.length,

        places,

        source:
            "Google Places",
    };
};

const getGooglePlaceDetails = async (
    placeId
) => {

    if (!placeId?.trim()) {
        throw new ApiError(
            400,
            "Google Place ID is required."
        );
    }


    const fieldMask = [
        "id",
        "name",
        "displayName",
        "formattedAddress",
        "shortFormattedAddress",
        "location",
        "primaryType",
        "types",
        "websiteUri",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "rating",
        "userRatingCount",
        "priceLevel",
        "googleMapsUri",
        "photos",
        "editorialSummary",
    ].join(",");


    let response;

    try {

        response = await fetch(
            `${GOOGLE_PLACES_BASE_URL}/places/${encodeURIComponent(placeId)}`,
            {
                method: "GET",

                headers:
                    getApiHeaders(
                        fieldMask
                    ),
            }
        );

    } catch (error) {

        console.error(
            "Google Place Details network error:",
            error.message
        );

        throw new ApiError(
            503,
            "Unable to connect to Google Places."
        );
    }


    if (!response.ok) {
        await handleGoogleApiError(
            response,
            "details"
        );
    }


    const place =
        await response.json();


    return normalizePlace(
        place
    );
};

const getGooglePlacePhoto = async ({
    photoResourceName,
    maxWidthPx = 1200,
    maxHeightPx = 1200,
}) => {

    if (!photoResourceName?.trim()) {
        throw new ApiError(
            400,
            "Google photo resource name is required."
        );
    }


    const safeWidth =
        Math.min(
            Math.max(
                Number(maxWidthPx) || 1200,
                1
            ),
            4800
        );

    const safeHeight =
        Math.min(
            Math.max(
                Number(maxHeightPx) || 1200,
                1
            ),
            4800
        );


    const params =
        new URLSearchParams({
            key:
                GOOGLE_PLACES_API_KEY,

            maxWidthPx:
                String(safeWidth),

            maxHeightPx:
                String(safeHeight),

            skipHttpRedirect:
                "true",
        });


    /*
     * photoResourceName should look like:
     *
     * places/PLACE_ID/photos/PHOTO_ID
     *
     * Google's endpoint becomes:
     *
     * /places/PLACE_ID/photos/PHOTO_ID/media
     */

    const photoPath =
        photoResourceName.endsWith(
            "/media"
        )
            ? photoResourceName
            : `${photoResourceName}/media`;


    let response;

    try {

        response = await fetch(
            `${GOOGLE_PLACES_BASE_URL}/${photoPath}?${params.toString()}`,
            {
                method: "GET",

                headers: {
                    Accept:
                        "application/json",
                },
            }
        );

    } catch (error) {

        console.error(
            "Google Place Photo network error:",
            error.message
        );

        throw new ApiError(
            503,
            "Unable to connect to Google Place Photos."
        );
    }


    if (!response.ok) {
        await handleGoogleApiError(
            response,
            "photo"
        );
    }


    const data =
        await response.json();


    if (!data.photoUri) {

        throw new ApiError(
            502,
            "Google did not return a photo URI."
        );
    }


    return {
        photoResourceName,

        photoUri:
            data.photoUri,

        source:
            "Google Places",
    };
};

const searchGooglePlacesWithPhotos = async ({
    query,
    latitude,
    longitude,
    radius = 10000,
    maxResultCount = 10,
}) => {

    const searchResult =
        await searchGooglePlaces({
            query,
            latitude,
            longitude,
            radius,
            maxResultCount,
        });


    /*
     * IMPORTANT:
     *
     * Search already returns photo resource names.
     *
     * We do NOT call the photo-media endpoint for
     * every result here.
     *
     * That keeps this endpoint efficient.
     */

    return searchResult;
};

export {
    searchGooglePlaces,
    getGooglePlaceDetails,
    getGooglePlacePhoto,
    searchGooglePlacesWithPhotos,
};