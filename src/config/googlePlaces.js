import dotenv from "dotenv";

dotenv.config();

export const GOOGLE_PLACES_API_KEY =
    process.env.GOOGLE_PLACES_API_KEY;

export const GOOGLE_PLACES_BASE_URL =
    "https://places.googleapis.com/v1";