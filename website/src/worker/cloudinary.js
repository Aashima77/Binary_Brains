
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(cameraId, base64Image) {
    try {
        const result = await cloudinary.v2.uploader.upload(
            `data:image/jpeg;base64,${base64Image}`,
            {
                folder: "aisoc",
                public_id: `violation-${cameraId}-${Date.now()}`,
            }
        );
        return result.secure_url;
    } catch (err) {
        console.error("[Cloudinary]", err.message);
        throw new Error("Failed to upload to Cloudinary");
    }
}
