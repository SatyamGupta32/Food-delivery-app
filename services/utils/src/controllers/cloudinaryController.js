import cloudinary from "cloudinary";
import { TryCatch } from "../middlewares/tryCatch.js";

export const uploadImage = TryCatch(async (req, res) => {
  const { buffer } = req.body;
  const cloud = await cloudinary.v2.uploader.upload(buffer);
  res.json({
    url: cloud.secure_url,
  });
});
