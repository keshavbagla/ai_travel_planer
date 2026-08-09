const generateSlug = (...parts) => {
    return parts
        .filter(
            (part) =>
                part &&
                String(part).trim() !== ""
        )
        .map((part) =>
            String(part)
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
        )
        .join("-");
};

export {
    generateSlug,
};