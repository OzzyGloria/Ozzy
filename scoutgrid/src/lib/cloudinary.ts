import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function generateUploadSignature(folder: string, uploadPreset?: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    timestamp,
    folder,
  };
  if (uploadPreset) params.upload_preset = uploadPreset;

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}

export function getVideoThumbnail(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: "video",
    transformation: [
      { width: 640, height: 360, crop: "fill" },
      { quality: "auto" },
      { format: "jpg" },
    ],
  });
}

export function getOptimizedImageUrl(publicId: string, width = 800): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width, crop: "limit" },
      { quality: "auto" },
      { format: "webp" },
    ],
  });
}
