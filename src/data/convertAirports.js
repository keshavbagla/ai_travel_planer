import fs from "fs";
import csv from "csv-parser";

const airports = [];

fs.createReadStream("./src/data/airports.csv")
    .pipe(csv())
    .on("data", (row) => {
        const iata = row.iata_code?.trim();

        if (
            iata &&
            row.latitude_deg &&
            row.longitude_deg &&
            ["large_airport", "medium_airport", "small_airport"].includes(row.type) &&
            row.scheduled_service === "yes"
        ) {
            airports.push({
                iata,
                icao: row.ident || null,
                name: row.name?.trim() || "",
                city: row.municipality?.trim() || "",
                countryCode: row.iso_country?.trim() || "",
                latitude: Number(row.latitude_deg),
                longitude: Number(row.longitude_deg),
                type: row.type,
                scheduledService: row.scheduled_service === "yes",
            });
        }
    })
    .on("end", () => {
        const output = `export const airports = ${JSON.stringify(airports, null, 2)};\n`;

        fs.writeFileSync("./src/data/airports.js", output);

        console.log(`✅ Generated airports.js with ${airports.length} airports`);
    });