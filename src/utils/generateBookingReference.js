const generateBookingReference = () => {
    const date = new Date();

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const random = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `BK-${year}${month}${day}-${random}`;
};

export {
    generateBookingReference,
};