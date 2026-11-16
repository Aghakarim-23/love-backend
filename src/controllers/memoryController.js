import mongoose from "mongoose";
import Memory from "../models/Memory.js";
import cloudinary, { uploadImage } from "../config/cloudinary.js";

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 1000;

// Bazadan gələn xatirəni frontend üçün səliqəli obyektə çevirir
const formatMemory = (memory) => {
  // Müəllifin hesabı silinibsə, memory.author null olur
  let author = null;

  if (memory.author) {
    author = {
      id: memory.author._id,
      name: memory.author.name,
    };
  }

  return {
    id: memory._id,
    title: memory.title,
    description: memory.description,
    date: memory.date,
    imageUrl: memory.imageUrl,
    author: author,
    createdAt: memory.createdAt,
  };
};

// GET /api/memories — bütün xatirələr
export const getMemories = async (req, res) => {
  try {
    // 1. Bütün xatirələri götür (ən yeni xatirə əvvəl)
    const memories = await Memory.find()
      .sort({ date: -1 })
      .populate("author", "name");

    // 2. Hər xatirəni səliqəyə sal
    const formattedMemories = memories.map((memory) => formatMemory(memory));

    // 3. Cavabı göndər
    return res.status(200).json({
      count: memories.length,
      memories: formattedMemories,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// POST /api/memories — yeni xatirə (şəkil ilə)
export const createMemory = async (req, res) => {
  try {
    const { title, description = "", date } = req.body;

    // 1. Şəkil göndərilibmi? (multer onu req.file-a qoyur)
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    // 2. Başlıq boşdursa, xəta qaytar
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Memory title is required",
      });
    }

    // 3. Çox uzundursa, xəta qaytar
    if (title.trim().length > TITLE_MAX_LENGTH) {
      return res.status(400).json({
        message: `Title can be at most ${TITLE_MAX_LENGTH} characters`,
      });
    }

    if (description.trim().length > DESCRIPTION_MAX_LENGTH) {
      return res.status(400).json({
        message: `Description can be at most ${DESCRIPTION_MAX_LENGTH} characters`,
      });
    }

    // 4. Tarix düzgündürmü? Göndərilməyibsə, bu günü götürürük
    const memoryDate = date ? new Date(date) : new Date();

    if (Number.isNaN(memoryDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    // 5. Şəkli Cloudinary-yə yüklə
    const uploadedImage = await uploadImage(req.file.buffer);

    // 6. Xatirəni yarat.
    //    author-u body-dən YOX, token-dən (req.userId) götürürük.
    const memory = await Memory.create({
      title: title.trim(),
      description: description.trim(),
      date: memoryDate,
      imageUrl: uploadedImage.secure_url,
      imagePublicId: uploadedImage.public_id,
      author: req.userId,
    });

    // 7. Müəllifin adını əlavə et
    await memory.populate("author", "name");

    // 8. Cavabı göndər
    return res.status(201).json({
      message: "Memory created successfully",
      memory: formatMemory(memory),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE /api/memories/:id — xatirəni sil
export const deleteMemory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ID düzgün formatdadırmı?
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid memory ID",
      });
    }

    // 2. Xatirəni bazada tap
    const memory = await Memory.findById(id);

    if (!memory) {
      return res.status(404).json({
        message: "Memory not found",
      });
    }

    // 3. Yalnız xatirəni əlavə edən şəxs onu silə bilər
    if (memory.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own memories",
      });
    }

    // 4. Əvvəlcə şəkli Cloudinary-dən, sonra xatirəni bazadan sil
    await cloudinary.uploader.destroy(memory.imagePublicId);
    await memory.deleteOne();

    return res.status(200).json({
      message: "Memory deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
