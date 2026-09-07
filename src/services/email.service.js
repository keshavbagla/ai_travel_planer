import { Resend } from "resend";
import { ApiError } from "../utils/ApiError.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev";

console.log("📧 RESEND FROM EMAIL:", FROM_EMAIL);

const sendEmail = async ({
    to,
    subject,
    html,
    text,
}) => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY is not configured");
        }

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [to],
            subject,
            html,
            text,
        });

        if (error) {
            console.error("❌ Email sending failed:", error);

            throw new Error(
                error.message || "Failed to send email"
            );
        }

        console.log(
            "✅ Email sent successfully:",
            data?.id
        );

        return {
            success: true,
            messageId: data?.id,
        };
    } catch (error) {
        console.error("Email Error:", error);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            error.message || "Failed to send email"
        );
    }
};

const sendOTP = async ({
    email,
    otp,
    purpose = "Verification",
}) => {
    const subject = `${purpose} OTP`;

    const text = `
Your OTP for ${purpose} is: ${otp}

This OTP is valid for 5 minutes.

If you didn't request this, please ignore this email.
`;

    const html = `
        <div style="font-family:Arial,sans-serif;padding:20px">

            <h2>AI Travel Planner</h2>

            <p>
                Your OTP for
                <strong>${purpose}</strong>
                is:
            </p>

            <h1 style="letter-spacing:4px">
                ${otp}
            </h1>

            <p>
                This OTP is valid for
                <strong>5 minutes</strong>.
            </p>

            <p>
                If you didn't request this,
                please ignore this email.
            </p>

        </div>
    `;

    return await sendEmail({
        to: email,
        subject,
        html,
        text,
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
                Start exploring amazing destinations
                with AI-powered planning.
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
        purpose: "Forgot Password",
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

            <p>
                Trip : ${tripName}
            </p>

            <p>
                Booking ID : ${bookingNumber}
            </p>

            <p>
                Have a wonderful journey.
            </p>

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

            <p>
                Amount : ₹${amount}
            </p>

            <p>
                Transaction ID : ${transactionId}
            </p>

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

            <p>
                ${tripTitle}
            </p>

            <p>
                ${startDate}
            </p>

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
    sendEmail,
    sendOTP,
    sendWelcomeEmail,
    sendForgotPasswordEmail,
    sendBookingConfirmation,
    sendPaymentReceipt,
    sendTripReminder,
    sendCustomEmail,
};