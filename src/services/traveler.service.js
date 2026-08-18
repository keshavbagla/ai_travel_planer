import { Traveler } from "../models/traveler.model.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";

const populateTraveler = (query) => {
    return query.populate(
        "user",
        "fullName email avatar"
    );
};

const validateUser = async (
    userId
) => {
    const user =
        await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return user;
};

const createTraveler = async ({
    travelerData,
    user,
}) => {

    await validateUser(user);

    const existingTraveler =
        await Traveler.findOne({
            user,
            firstName:
                travelerData.firstName,
            lastName:
                travelerData.lastName,
            dateOfBirth:
                travelerData.dateOfBirth,
            isActive: true,
        });

    if (existingTraveler) {
        throw new ApiError(
            409,
            "This traveler already exists."
        );
    }

    // If this is the first traveler,
    // make it primary automatically

    const travelerCount =
        await Traveler.countDocuments({
            user,
            isActive: true,
        });

    if (travelerCount === 0) {
        travelerData.isPrimary = true;
    }

    // If requested as primary,
    // remove primary from others

    if (travelerData.isPrimary) {
        await Traveler.updateMany(
            {
                user,
                isActive: true,
            },
            {
                $set: {
                    isPrimary: false,
                },
            }
        );
    }

    const traveler =
        await Traveler.create({
            ...travelerData,
            user,
        });

    return await populateTraveler(
        Traveler.findById(
            traveler._id
        )
    );
};

// Get All Travelers

const getAllTravelers = async ({
    user,
    page = 1,
    limit = 10,
} = {}) => {
    page = Number(page);
    limit = Number(limit);

    const skip =
        (page - 1) * limit;

    const query = {
        user,
        isActive: true,
    };

    const [
        travelers,
        total,
    ] = await Promise.all([
        populateTraveler(
            Traveler.find(query)
                .sort({
                    isPrimary: -1,
                    createdAt: -1,
                })
                .skip(skip)
                .limit(limit)
        ),

        Traveler.countDocuments(
            query
        ),
    ]);

    return {
        travelers,
        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
};

// Get Traveler By ID

const getTravelerById = async ({
    travelerId,
    user,
}) => {
    const traveler =
        await populateTraveler(
            Traveler.findOne({
                _id: travelerId,
                user,
                isActive: true,
            })
        );

    if (!traveler) {
        throw new ApiError(
            404,
            "Traveler not found."
        );
    }

    return traveler;
};

const updateTraveler = async ({
    travelerId,
    travelerData,
    user,
}) => {
    const traveler =
        await Traveler.findOne({
            _id: travelerId,
            user,
            isActive: true,
        });

    if (!traveler) {
        throw new ApiError(
            404,
            "Traveler not found."
        );
    }

    const newFirstName =
        travelerData.firstName ??
        traveler.firstName;

    const newLastName =
        travelerData.lastName ??
        traveler.lastName;

    const newDateOfBirth =
        travelerData.dateOfBirth ??
        traveler.dateOfBirth;

    if (
        newFirstName !==
            traveler.firstName ||
        newLastName !==
            traveler.lastName ||
        String(newDateOfBirth) !==
            String(traveler.dateOfBirth)
    ) {
        const existingTraveler =
            await Traveler.findOne({
                user,
                firstName:
                    newFirstName,
                lastName:
                    newLastName,
                dateOfBirth:
                    newDateOfBirth,
                isActive: true,
                _id: {
                    $ne: travelerId,
                },
            });

        if (existingTraveler) {
            throw new ApiError(
                409,
                "Another traveler with the same details already exists."
            );
        }
    }


    if (
        travelerData.isPrimary ===
        true
    ) {
        await Traveler.updateMany(
            {
                user,
                isActive: true,
                _id: {
                    $ne: travelerId,
                },
            },
            {
                $set: {
                    isPrimary: false,
                },
            }
        );
    }

    Object.entries(
        travelerData
    ).forEach(
        ([key, value]) => {
            if (
                value !== undefined &&
                value !== null
            ) {
                traveler[key] = value;
            }
        }
    );

    await traveler.save();

    return await populateTraveler(
        Traveler.findById(
            traveler._id
        )
    );
};

const deleteTraveler = async ({
    travelerId,
    user,
}) => {
    const traveler =
        await Traveler.findOne({
            _id: travelerId,
            user,
            isActive: true,
        });

    if (!traveler) {
        throw new ApiError(
            404,
            "Traveler not found."
        );
    }

    const wasPrimary =
        traveler.isPrimary;

    traveler.isActive = false;
    traveler.isPrimary = false;

    await traveler.save();


    if (wasPrimary) {
        const nextTraveler =
            await Traveler.findOne({
                user,
                isActive: true,
            }).sort({
                createdAt: 1,
            });

        if (nextTraveler) {
            nextTraveler.isPrimary =
                true;

            await nextTraveler.save();
        }
    }
};

const setPrimaryTraveler = async ({
    travelerId,
    user,
}) => {
    const traveler =
        await Traveler.findOne({
            _id: travelerId,
            user,
            isActive: true,
        });

    if (!traveler) {
        throw new ApiError(
            404,
            "Traveler not found."
        );
    }

    await Traveler.updateMany(
        {
            user,
            isActive: true,
        },
        {
            $set: {
                isPrimary: false,
            },
        }
    );

    traveler.isPrimary = true;

    await traveler.save();

    return await populateTraveler(
        Traveler.findById(
            traveler._id
        )
    );
};

const searchTravelers = async ({
    keyword,
    user,
}) => {
    if (!keyword) {
        return [];
    }

    return await populateTraveler(
        Traveler.find({
            user,
            isActive: true,
            $or: [
                {
                    firstName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    lastName: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
                {
                    phone: {
                        $regex: keyword,
                        $options: "i",
                    },
                },
            ],
        })
            .sort({
                isPrimary: -1,
                createdAt: -1,
            })
            .limit(20)
    );
};

export const travelerService = {
    createTraveler,
    getAllTravelers,
    getTravelerById,
    updateTraveler,
    deleteTraveler,
    setPrimaryTraveler,
    searchTravelers,
};