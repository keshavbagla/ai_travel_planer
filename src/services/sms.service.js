import axios from "axios";
import { ApiError } from "../utils/ApiError.js";


export const sendOTPSMS = async (phoneNumber, otp) => {
    try {

        const formattedPhoneNumber = phoneNumber.startsWith("+91")
            ? phoneNumber
            : `91${phoneNumber}`;

        const response = await axios.post(
            "https://control.msg91.com/api/v5/otp",
            {
                mobile: formattedPhoneNumber,
                otp: otp,
                template_id: process.env.MSG91_TEMPLATE_ID,
            },
            {
                headers: {
                    authkey: process.env.MSG91_AUTH_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "MSG91 OTP Error:",
            error.response?.data || error.message
        );

        throw new ApiError(
            500,
            "Failed to send OTP via SMS"
        );

    }
};

export const sendSMS = async (phoneNumber, message) => {

    try {

        const formattedPhoneNumber = phoneNumber.startsWith("+91")
            ? phoneNumber
            : `91${phoneNumber}`;

        const response = await axios.post(
            "https://control.msg91.com/api/v5/flow",
            {
                template_id: process.env.MSG91_SMS_TEMPLATE_ID,

                short_url: "0",

                recipients: [
                    {
                        mobiles: formattedPhoneNumber,
                        VAR1: message,
                    },
                ],
            },
            {
                headers: {
                    authkey: process.env.MSG91_AUTH_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "MSG91 SMS Error:",
            error.response?.data || error.message
        );

        throw new ApiError(
            500,
            "Failed to send SMS"
        );

    }

};