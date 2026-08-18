const normalizeValue = (value) =>
    String(value)
        .trim()
        .toUpperCase();

const createFlightSearchCacheKey = ({
    departureIata,
    arrivalIata,
    outboundDate,
    adults = 1,
    travelClass = "ECONOMY",
    currency = "INR",
}) => {
    return [
        "flight-search",
        normalizeValue(departureIata),
        normalizeValue(arrivalIata),
        outboundDate,
        Number(adults),
        normalizeValue(travelClass),
        normalizeValue(currency),
    ].join(":");
};

export {
    createFlightSearchCacheKey,
};