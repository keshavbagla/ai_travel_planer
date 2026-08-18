import axios from "axios";

const duffel = axios.create({
    baseURL: process.env.DUFFEL_BASE_URL,
    headers: {
        Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
        "Duffel-Version": "v2",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

export default duffel;