import https from "https";

const HOST =
    process.env.BOOKING_API_HOST?.trim() ||
    "booking-com15.p.rapidapi.com";

const BASE_URL =
    process.env.BOOKING_API_BASE_URL?.trim() ||
    "https://booking-com15.p.rapidapi.com";

const API_KEY =
    process.env.RAPIDAPI_KEY?.trim();


const bookingRequest = ({
    endpoint,
    query = {},
}) => {

    return new Promise((resolve, reject) => {

        if (!API_KEY) {
            return reject(
                new Error(
                    "RAPIDAPI_KEY is not configured."
                )
            );
        }


        const params =
            new URLSearchParams();


        Object.entries(query).forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    params.append(
                        key,
                        String(value)
                    );
                }
            }
        );


        const path =
            `${endpoint}?${params.toString()}`;


        console.log(
            "\n========== BOOKING API =========="
        );

        console.log("HOST:", HOST);
        console.log("PATH:", path);
        console.log(
            "KEY LOADED:",
            Boolean(API_KEY)
        );


        const options = {

            hostname: HOST,

            port: 443,

            path,

            method: "GET",

            headers: {

                "x-rapidapi-key":
                    API_KEY,

                "x-rapidapi-host":
                    HOST,

                "Content-Type":
                    "application/json",
            },
        };


        const request =
            https.request(
                options,
                (response) => {

                    const chunks = [];


                    response.on(
                        "data",
                        (chunk) => {
                            chunks.push(chunk);
                        }
                    );


                    response.on(
                        "end",
                        () => {

                            const rawBody =
                                Buffer
                                    .concat(chunks)
                                    .toString();


                            let data;

                            try {

                                data =
                                    JSON.parse(
                                        rawBody
                                    );

                            } catch {

                                data =
                                    rawBody;
                            }


                            console.log(
                                "STATUS:",
                                response.statusCode
                            );


                            if (
                                response.statusCode >=
                                    200 &&
                                response.statusCode < 300
                            ) {

                                console.log(
                                    "BOOKING API SUCCESS"
                                );

                                return resolve(
                                    data
                                );
                            }


                            const error =
                                new Error(
                                    data?.message ||
                                    data?.error ||
                                    `Booking API failed: ${response.statusCode}`
                                );


                            error.statusCode =
                                response.statusCode;

                            error.data =
                                data;


                            reject(error);
                        }
                    );
                }
            );


        request.on(
            "error",
            (error) => {

                console.error(
                    "BOOKING API ERROR:",
                    error
                );

                reject(error);
            }
        );


        request.end();
    });
};


const searchHotelsExternal = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/searchHotels",

        query,
    });
};




const searchHotelsByCoordinates = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/searchHotelsByCoordinates",

        query,
    });
};




const getHotelFilter = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/getFilter",

        query,
    });
};


const getHotelDetailsExternal = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/getHotelDetails",

        query,
    });
};




const getRoomAvailability = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/getRoomAvailability",

        query,
    });
};



const getRoomList = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/getRoomList",

        query,
    });
};


const getRoomListWithAvailability =
    async (query) => {

        return bookingRequest({

            endpoint:
                "/api/v1/hotels/getRoomListWithAvailability",

            query,
        });
    };




const getHotelPhotos = async (
    query
) => {

    return bookingRequest({

        endpoint:
            "/api/v1/hotels/getHotelPhotos",

        query,
    });
};


// ============================================================
// LITEAPI HOTEL BOOKING
// ============================================================

const LITEAPI_BOOKING_BASE_URL =
    process.env.LITEAPI_BOOKING_BASE_URL ||
    "https://book.liteapi.travel/v3.0";

const LITEAPI_API_KEY =
    process.env.LITEAPI_API_KEY?.trim();


const requestLiteApi = async ({
    endpoint,
    method = "GET",
    body,
    query = {},
}) => {

    if (!LITEAPI_API_KEY) {

        throw new Error(
            "LITEAPI_API_KEY is not configured."
        );
    }


    const url =
        new URL(
            `${LITEAPI_BOOKING_BASE_URL}${endpoint}`
        );


    Object.entries(query).forEach(
        ([key, value]) => {

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                url.searchParams.set(
                    key,
                    String(value)
                );
            }
        }
    );


    const headers = {

        "X-API-Key":
            LITEAPI_API_KEY,

        "Accept":
            "application/json",
    };


    if (
        body !== undefined
    ) {

        headers["Content-Type"] =
            "application/json";
    }


    console.log(
        "\n========== LITEAPI REQUEST =========="
    );

    console.log(
        "METHOD:",
        method
    );

    console.log(
        "URL:",
        url.toString()
    );

    console.log(
        "BODY:",
        body
    );


    const response =
        await fetch(
            url,
            {
                method,
                headers,

                body:
                    body !== undefined
                        ? JSON.stringify(body)
                        : undefined,
            }
        );


    const raw =
        await response.text();


    let data = null;


    try {

        data =
            raw
                ? JSON.parse(raw)
                : null;

    } catch {

        data = raw;
    }


    console.log(
        "STATUS:",
        response.status
    );

    console.log(
        "RESPONSE:",
        data
    );

    console.log(
        "====================================\n"
    );


    if (!response.ok) {

        const error =
            new Error(

                data?.message ||

                data?.error?.message ||

                data?.error ||

                `LiteAPI request failed: ${response.status}`
            );


        error.statusCode =
            response.status;

        error.data =
            data;


        throw error;
    }


    return data;
};


const liteApiPrebook = async (
    body
) => {

    return requestLiteApi({

        endpoint:
            "/rates/prebook",

        method:
            "POST",

        body,
    });
};


const liteApiBook = async (
    body
) => {

    return requestLiteApi({

        endpoint:
            "/rates/book",

        method:
            "POST",

        body,
    });
};



const liteApiGetBooking = async (
    bookingId
) => {

    return requestLiteApi({

        endpoint:
            `/bookings/${bookingId}`,

        method:
            "GET",
    });
};


const liteApiListBookings = async (
    query = {}
) => {

    return requestLiteApi({

        endpoint:
            "/bookings",

        method:
            "GET",

        query,
    });
};


const liteApiCancelBooking = async (
    bookingId
) => {

    return requestLiteApi({

        endpoint:
            `/bookings/${bookingId}`,

        method:
            "PUT",
    });
};

const liteApiGetPrebook = async (
    prebookId
) => {

    return requestLiteApi({

        endpoint:
            `/prebooks/${prebookId}`,

        method:
            "GET",
    });
};

const confirmHotelBooking = async (body) => {
    return requestLiteApi({
        endpoint: "/rates/book",
        method: "POST",
        body,
    });
};

const getExternalHotelBooking = async (
    bookingId
) => {

    return requestLiteApi({
        endpoint:
            `/bookings/${bookingId}`,

        method:
            "GET",
    });
};

const cancelExternalHotelBooking = async (
    bookingId
) => {

    return requestLiteApi({
        endpoint:
            `/bookings/${bookingId}`,

        method:
            "PUT",
    });
};


export {
    searchHotelsExternal,
    searchHotelsByCoordinates,
    getHotelFilter,
    getHotelDetailsExternal,
    getRoomAvailability,
    getRoomList,
    getRoomListWithAvailability,
    getHotelPhotos,

    liteApiPrebook,
    liteApiBook,
    liteApiGetBooking,
    liteApiListBookings,
    liteApiCancelBooking,
    liteApiGetPrebook,
};
