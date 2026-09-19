import "dotenv/config";
import axios from "axios";

const OPENTRIPMAP_API_KEY =
    process.env.OPENTRIPMAP_API_KEY;

const OPENTRIPMAP_BASE_URL =
    process.env.OPENTRIPMAP_BASE_URL ||
    "https://api.opentripmap.com";

if (!OPENTRIPMAP_API_KEY) {
    throw new Error(
        "OPENTRIPMAP_API_KEY is not configured."
    );
}

const openTripMapClient = axios.create({
    baseURL: OPENTRIPMAP_BASE_URL,
    timeout: 15000,
});

export {
    openTripMapClient,
    OPENTRIPMAP_API_KEY,
};