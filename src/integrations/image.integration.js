const GEOAPIFY_PLACES_BASE_URL =
    "https://api.geoapify.com/v2";

const requestGeoapify = async (
    endpoint,
    params = {}
) => {
    const url = new URL(
        `${GEOAPIFY_PLACES_BASE_URL}${endpoint}`
    );

    Object.entries({
        ...params,
        apiKey:
            process.env.GEOAPIFY_PLACES_API_KEY,
    }).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {
            url.searchParams.set(
                key,
                value
            );
        }
    });

    const response = await fetch(url);

    const data =
        await response.json().catch(
            () => null
        );

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.error ||
            `Geoapify request failed with status ${response.status}.`
        );
    }

    return data;
};


// Search places
const searchPlaces = async ({
    categories,
    lat,
    lon,
    radius = 5000,
    limit = 20,
    bias = true,
    name,
}) => {
    const params = {
        categories,
        filter: `circle:${lon},${lat},${radius}`,
        limit,
    };

    if (bias) {
        params.bias =
            `proximity:${lon},${lat}`;
    }

    if (name) {
        params.name = name;
    }

    return await requestGeoapify(
        "/places",
        params
    );
};
const getPlaceDetails = async ({
    placeId,
}) => {
    return await requestGeoapify(
        "/place-details",
        {
            id: placeId,
        }
    );
};


export {
    searchPlaces,
    getPlaceDetails,
};