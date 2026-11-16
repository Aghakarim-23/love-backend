import { v2 as cloudinary } from "cloudinary";

// .env-dəki açarlarla Cloudinary-ni qoşuruq.
// server.js-də dotenv.config()-dan SONRA çağırılır.
export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Yaddaşdakı şəkli (buffer) Cloudinary-yə yükləyir
export const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "our-little-world/memories" },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export default cloudinary;
