import axios from "axios";
import { TryCatch } from "../middlewares/tryCatch.js";

export const reverseGeocode = TryCatch(async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).json({ message: "lat and lon are required" });
    }
    const { data } = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { format: "json", lat, lon },
        headers: { "User-Agent": "food-delivery-app/1.0 (local-dev)" },
    });
    res.json({
        display_name: data.display_name,
        address: data.address || {},
    });
});