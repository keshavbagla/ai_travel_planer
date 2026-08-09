import crypto from "crypto";
import { OTP } from "../models/otp.model.js";
import { ApiError } from "../utils/ApiError.js";

export const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const generateOTPExpiry = (minutes = 5) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const hasActiveOTP = async (userId, purpose) => {
  return await OTP.exists({
    user: userId,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
};

export const createOTP = async ({
  userId,
  email,
  phoneNumber,
  purpose
}) => {
  await OTP.deleteMany({
    user: userId,
    purpose
  });

  const otp = generateOTP();
  const otpDocument = await OTP.create({
        user: userId,

        email,

        phoneNumber,

        otp,

        purpose,

        expiresAt: generateOTPExpiry()

    });

    return {

        otp,

        otpDocument

    };

};

export const verifyOTP = async ({

    userId,

    otp,

    purpose

}) => {

    const otpRecord = await OTP.findOne({

        user: userId,

        otp,

        purpose,

        isUsed: false

    });

    if (!otpRecord) {

        throw new ApiError(
            400,
            "Invalid OTP"
        );

    }

    if (
        otpRecord.expiresAt < new Date()
    ) {

        throw new ApiError(
            400,
            "OTP has expired"
        );

    }

    return otpRecord;

};

export const deleteOTP = async (
    otpId
) => {

    return await OTP.findByIdAndDelete(
        otpId
    );

};

export const deleteUserOTPs = async (
    userId,
    purpose
) => {

    return await OTP.deleteMany({

        user: userId,

        purpose

    });

};

export const resendOTP = async ({

    userId,

    email,

    phoneNumber,

    purpose

}) => {

    await deleteUserOTPs(
        userId,
        purpose
    );

    return await createOTP({

        userId,

        email,

        phoneNumber,

        purpose

  });
};

export const otpService = {
    createOTP,
    verifyOTP,
    resendOTP,
    deleteOTP,
    deleteUserOTPs,
};