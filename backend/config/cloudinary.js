// config/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// ✅ Configure Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    // ✅ delete local file after upload
    fs.unlinkSync(filePath);

    return uploadResult.secure_url;
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    throw new Error("Cloudinary upload failed");
  }
};

export default uploadOnCloudinary;
