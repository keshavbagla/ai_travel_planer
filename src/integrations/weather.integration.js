const WEATHER_BASE_URL =
    "https://api.weatherapi.com/v1/forecast.json";

const getWeather = async ({
    location,
    days = 7,
}) => {
    const url = new URL(
        WEATHER_BASE_URL
    );

    url.searchParams.set(
        "key",
        process.env.WEATHER_API_KEY
    );

    url.searchParams.set(
        "q",
        location
    );

    url.searchParams.set(
        "days",
        days
    );

    url.searchParams.set(
        "aqi",
        "no"
    );

    url.searchParams.set(
        "alerts",
        "yes"
    );

    const response =
        await fetch(url);

    if (!response.ok) {
        const errorData =
            await response.json().catch(
                () => null
            );

        throw new Error(
            errorData?.error?.message ||
            `Weather API request failed with status ${response.status}.`
        );
    }

    return await response.json();
};

export {
    getWeather,
};