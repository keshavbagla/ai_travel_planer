import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const validGenders = [
    "Male",
    "Female",
    "Other",
];

const validTravelerTypes = [
    "Adult",
    "Child",
    "Infant",
];

// Create Traveler Validation

const validateCreateTraveler = (
    data
) => {
    const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        nationality,
        email,
        phone,
        passport,
        travelerType,
        isPrimary,
    } = data;

    // First Name

    if (!firstName) {
        throw new ApiError(
            400,
            "First name is required."
        );
    }

    if (
        typeof firstName !== "string" ||
        firstName.trim().length < 2
    ) {
        throw new ApiError(
            400,
            "First name must contain at least 2 characters."
        );
    }

    // Last Name

    if (!lastName) {
        throw new ApiError(
            400,
            "Last name is required."
        );
    }

    if (
        typeof lastName !== "string" ||
        lastName.trim().length < 2
    ) {
        throw new ApiError(
            400,
            "Last name must contain at least 2 characters."
        );
    }

    // Date of Birth

    if (!dateOfBirth) {
        throw new ApiError(
            400,
            "Date of birth is required."
        );
    }

    const dob =
        new Date(dateOfBirth);

    if (isNaN(dob.getTime())) {
        throw new ApiError(
            400,
            "Invalid date of birth."
        );
    }

    if (dob > new Date()) {
        throw new ApiError(
            400,
            "Date of birth cannot be in the future."
        );
    }

    // Gender

    if (
        !gender ||
        !validGenders.includes(
            gender
        )
    ) {
        throw new ApiError(
            400,
            "Invalid gender."
        );
    }

    // Nationality

    if (!nationality) {
        throw new ApiError(
            400,
            "Nationality is required."
        );
    }

    if (
        typeof nationality !== "string" ||
        nationality.trim().length < 2
    ) {
        throw new ApiError(
            400,
            "Invalid nationality."
        );
    }

    // Email

    if (
        email !== undefined &&
        email !== null &&
        email !== ""
    ) {
        if (
            typeof email !== "string"
        ) {
            throw new ApiError(
                400,
                "Email must be a string."
            );
        }

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailRegex.test(
                email
            )
        ) {
            throw new ApiError(
                400,
                "Invalid email address."
            );
        }
    }

    // Phone

    if (
        phone !== undefined &&
        phone !== null &&
        phone !== ""
    ) {
        if (
            typeof phone !== "string"
        ) {
            throw new ApiError(
                400,
                "Phone number must be a string."
            );
        }

        if (
            !/^[0-9+\-\s]{7,20}$/.test(
                phone
            )
        ) {
            throw new ApiError(
                400,
                "Invalid phone number."
            );
        }
    }

    // Traveler Type

    if (
        travelerType !== undefined &&
        !validTravelerTypes.includes(
            travelerType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid traveler type."
        );
    }

    // Primary Traveler

    if (
        isPrimary !== undefined &&
        typeof isPrimary !==
            "boolean"
    ) {
        throw new ApiError(
            400,
            "isPrimary must be a boolean."
        );
    }

    // Passport

    if (
        passport !== undefined &&
        passport !== null
    ) {
        validatePassport(
            passport
        );
    }
};

// Passport Validation

const validatePassport = (
    passport
) => {
    if (
        typeof passport !==
        "object"
    ) {
        throw new ApiError(
            400,
            "Invalid passport information."
        );
    }

    if (
        passport.passportNumber !==
            undefined &&
        passport.passportNumber !== ""
    ) {
        if (
            typeof passport.passportNumber !==
            "string"
        ) {
            throw new ApiError(
                400,
                "Passport number must be a string."
            );
        }

        if (
            passport.passportNumber
                .trim()
                .length < 5
        ) {
            throw new ApiError(
                400,
                "Invalid passport number."
            );
        }
    }

    if (
        passport.issueDate !==
            undefined &&
        passport.issueDate !== null
    ) {
        const issueDate =
            new Date(
                passport.issueDate
            );

        if (
            isNaN(
                issueDate.getTime()
            )
        ) {
            throw new ApiError(
                400,
                "Invalid passport issue date."
            );
        }
    }

    if (
        passport.expiryDate !==
            undefined &&
        passport.expiryDate !== null
    ) {
        const expiryDate =
            new Date(
                passport.expiryDate
            );

        if (
            isNaN(
                expiryDate.getTime()
            )
        ) {
            throw new ApiError(
                400,
                "Invalid passport expiry date."
            );
        }
    }

    if (
        passport.issueDate &&
        passport.expiryDate
    ) {
        const issueDate =
            new Date(
                passport.issueDate
            );

        const expiryDate =
            new Date(
                passport.expiryDate
            );

        if (
            expiryDate <= issueDate
        ) {
            throw new ApiError(
                400,
                "Passport expiry date must be after issue date."
            );
        }
    }

    if (
        passport.issuingCountry !==
            undefined &&
        passport.issuingCountry !== ""
    ) {
        if (
            typeof passport.issuingCountry !==
            "string"
        ) {
            throw new ApiError(
                400,
                "Passport issuing country must be a string."
            );
        }
    }
};

// Update Traveler Validation

const validateUpdateTraveler = (
    data
) => {
    if (
        !Object.keys(data).length
    ) {
        throw new ApiError(
            400,
            "No update data provided."
        );
    }

    if (
        data.firstName !==
        undefined
    ) {
        if (
            typeof data.firstName !==
                "string" ||
            data.firstName
                .trim()
                .length < 2
        ) {
            throw new ApiError(
                400,
                "First name must contain at least 2 characters."
            );
        }
    }

    if (
        data.lastName !==
        undefined
    ) {
        if (
            typeof data.lastName !==
                "string" ||
            data.lastName
                .trim()
                .length < 2
        ) {
            throw new ApiError(
                400,
                "Last name must contain at least 2 characters."
            );
        }
    }

    if (
        data.dateOfBirth !==
        undefined
    ) {
        const dob =
            new Date(
                data.dateOfBirth
            );

        if (
            isNaN(
                dob.getTime()
            )
        ) {
            throw new ApiError(
                400,
                "Invalid date of birth."
            );
        }

        if (
            dob > new Date()
        ) {
            throw new ApiError(
                400,
                "Date of birth cannot be in the future."
            );
        }
    }

    if (
        data.gender !==
        undefined &&
        !validGenders.includes(
            data.gender
        )
    ) {
        throw new ApiError(
            400,
            "Invalid gender."
        );
    }

    if (
        data.nationality !==
        undefined
    ) {
        if (
            typeof data.nationality !==
                "string" ||
            data.nationality
                .trim()
                .length < 2
        ) {
            throw new ApiError(
                400,
                "Invalid nationality."
            );
        }
    }

    if (
        data.email !==
            undefined &&
        data.email !== null &&
        data.email !== ""
    ) {
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            typeof data.email !==
                "string" ||
            !emailRegex.test(
                data.email
            )
        ) {
            throw new ApiError(
                400,
                "Invalid email address."
            );
        }
    }

    if (
        data.phone !==
            undefined &&
        data.phone !== null &&
        data.phone !== ""
    ) {
        if (
            typeof data.phone !==
                "string" ||
            !/^[0-9+\-\s]{7,20}$/.test(
                data.phone
            )
        ) {
            throw new ApiError(
                400,
                "Invalid phone number."
            );
        }
    }

    if (
        data.travelerType !==
            undefined &&
        !validTravelerTypes.includes(
            data.travelerType
        )
    ) {
        throw new ApiError(
            400,
            "Invalid traveler type."
        );
    }

    if (
        data.isPrimary !==
            undefined &&
        typeof data.isPrimary !==
            "boolean"
    ) {
        throw new ApiError(
            400,
            "isPrimary must be a boolean."
        );
    }

    if (
        data.passport !==
            undefined &&
        data.passport !== null
    ) {
        validatePassport(
            data.passport
        );
    }
};

const validateTravelerId = (
    travelerId
) => {
    if (!travelerId) {
        throw new ApiError(
            400,
            "Traveler ID is required."
        );
    }

    if (
        !mongoose.Types.ObjectId.isValid(
            travelerId
        )
    ) {
        throw new ApiError(
            400,
            "Invalid traveler ID."
        );
    }
};

export {
    validateCreateTraveler,
    validateUpdateTraveler,
    validateTravelerId,
};