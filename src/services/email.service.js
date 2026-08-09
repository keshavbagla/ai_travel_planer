import nodemailer from "nodemailer";

import { ApiError } from "../utils/ApiError.js";

const createTransporter = () => {

    return nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "true",

        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

};

const verifyTransporter = async () => {

    try {

        const transporter =
            createTransporter();

        await transporter.verify();

        console.log(
            "✅ Email server connected."
        );

    } catch (error) {

        console.error(
            "❌ Email server connection failed."
        );

        console.error(error);

    }

};
const sendEmail = async ({
    to,
    subject,
    html,
    text,
}) => {

    try {

        const transporter =
            createTransporter();

        const info =
            await transporter.sendMail({

                from: process.env.MAIL_FROM,

                to,

                subject,

                text,

                html,

            });

        return {

            success: true,

            messageId:
                info.messageId,

            accepted:
                info.accepted,

            rejected:
                info.rejected,

            response:
                info.response,

        };

    } catch (error) {

        console.error(
            "Email Error:",
            error
        );

        throw new ApiError(
            500,
            error.message ||
            "Failed to send email"
        );

    }

};

const sendOTP = async ({

    email,

    otp,

    purpose = "Verification"

}) => {

    const subject = `${purpose} OTP`;

    const html = `
        <div style="font-family:Arial,sans-serif;padding:20px">
            <h2>AI Travel Planner</h2>

            <p>Your OTP for <strong>${purpose}</strong> is:</p>

            <h1 style="letter-spacing:4px">
                ${otp}
            </h1>

            <p>This OTP is valid for <strong>5 minutes</strong>.</p>

            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;

    return await sendEmail({

        to: email,

        subject,

        html,

    });

};

const sendWelcomeEmail = async ({

    email,

    fullName,

}) => {

    const html = `
        <div style="font-family:Arial,sans-serif;padding:20px">

            <h2>Welcome ${fullName} 🎉</h2>

            <p>

                Thank you for joining AI Travel Planner.

            </p>

            <p>

                Start exploring amazing destinations with AI-powered planning.

            </p>

        </div>
    `;

    return await sendEmail({

        to: email,

        subject: "Welcome to AI Travel Planner",

        html,

    });

};

const sendForgotPasswordEmail = async ({

    email,

    otp,

}) => {

    return await sendOTP({

        email,

        otp,

        purpose: "Forgot Password"

    });

};


const sendBookingConfirmation = async ({

    email,

    bookingNumber,

    tripName,

}) => {

    const html = `
        <div style="font-family:Arial;padding:20px">

            <h2>Booking Confirmed ✅</h2>

            <p>Trip : ${tripName}</p>

            <p>Booking ID : ${bookingNumber}</p>

            <p>Have a wonderful journey.</p>

        </div>
    `;

    return await sendEmail({

        to: email,

        subject: "Booking Confirmation",

        html,

    });

};

const sendPaymentReceipt = async ({

    email,

    amount,

    transactionId,

}) => {

    const html = `
        <div style="font-family:Arial;padding:20px">

            <h2>Payment Successful</h2>

            <p>Amount : ₹${amount}</p>

            <p>Transaction ID : ${transactionId}</p>

        </div>
    `;

    return await sendEmail({

        to: email,

        subject: "Payment Receipt",

        html,

    });

};

const sendTripReminder = async ({

    email,

    tripTitle,

    startDate,

}) => {

    const html = `
        <div style="font-family:Arial;padding:20px">

            <h2>Your Trip Starts Soon ✈️</h2>

            <p>${tripTitle}</p>

            <p>${startDate}</p>

        </div>
    `;

    return await sendEmail({

        to: email,

        subject: "Trip Reminder",

        html,

    });

};

const sendCustomEmail = async ({

    email,

    subject,

    html,

}) => {

    return await sendEmail({

        to: email,

        subject,

        html,

    });

};

export const emailService = {

    verifyTransporter,

    sendEmail,

    sendOTP,

    sendWelcomeEmail,

    sendForgotPasswordEmail,

    sendBookingConfirmation,

    sendPaymentReceipt,

    sendTripReminder,

    sendCustomEmail,

};