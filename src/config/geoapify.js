import "dotenv/config";
import axios from "axios";

const GEOAPIFY_API_KEY =
    process.env.GEOAPIFY_API_KEY;

const BASE_URL =
    process.env.GEOAPIFY_BASE_URL ||
    "https://api.geoapify.com";

if (!GEOAPIFY_API_KEY) {
    throw new Error(
        "GEOAPIFY_API_KEY is not configured."
    );
}

const geoapifyClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

export {
    geoapifyClient,
    GEOAPIFY_API_KEY,
};