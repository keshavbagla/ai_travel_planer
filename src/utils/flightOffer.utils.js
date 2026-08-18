const sanitizeFlightOffer = (offer) => {
    if (!offer) {
        return null;
    }

    const data =
        typeof offer.toObject === "function"
            ? offer.toObject()
            : { ...offer };

    delete data.bookingToken;

    return data;
};

export {
    sanitizeFlightOffer,
};