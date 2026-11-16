import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Şəkli diskə yazmırıq, yaddaşda saxlayıb birbaşa Cloudinary-yə göndəririk
const storage = multer.memoryStorage();

// Yalnız şəkil fayllarını qəbul edirik
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Bir şəkil qəbul edir və xətaları JSON cavab kimi qaytarır
export const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Image can be at most 5 MB",
      });
    }

    return res.status(400).json({
      message: error.message,
    });
  });
};
