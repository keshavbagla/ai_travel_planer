import {
    getWeather,
} from "../integrations/weather.integration.js";

const getWeatherForecast = async ({
    location,
    days = 7,
}) => {
    return await getWeather({
        location,
        days,
    });
};

export {
    getWeatherForecast,
};