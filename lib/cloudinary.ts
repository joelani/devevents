import { v2 as cloudinary } from "cloudinary";

// Prefer letting the SDK parse CLOUDINARY_URL automatically. Only fall back
// to explicit config when individual env vars are provided.
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload a buffer to Cloudinary using an upload stream.
 * Returns the uploaded resource's secure URL and public_id.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  filename = "upload",
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image", public_id: `events/${filename}` },
      (error, result) => {
        if (error) return reject(error);
        if (!result || !result.secure_url || !result.public_id)
          return reject(new Error("Invalid Cloudinary response"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
}
