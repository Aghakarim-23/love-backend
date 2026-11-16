import mongoose from "mongoose";
import Letter from "../models/Letter.js";
import User from "../models/User.js";

const TITLE_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 2000;

// Populate olunmuş istifadəçini { id, name } formasına salır.
// Hesab silinibsə, null qaytarır ki, xəta almayaq.
const formatUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
  };
};

// Bazadan gələn məktubu frontend üçün səliqəli obyektə çevirir
const formatLetter = (letter) => {
  return {
    id: letter._id,
    title: letter.title,
    message: letter.message,
    from: formatUser(letter.author),
    to: formatUser(letter.recipient),
    createdAt: letter.createdAt,
    updatedAt: letter.updatedAt,
  };
};

// GET /api/letters — bütün məktublar
export const getLetters = async (req, res) => {
  try {
    // 1. Bütün məktubları götür (ən yenisi əvvəl).
    //    populate: ID-lərin yerinə istifadəçilərin adını gətirir.
    const letters = await Letter.find()
      .sort({ createdAt: -1 })
      .populate("author", "name")
      .populate("recipient", "name");

    // 2. Hər məktubu formatLetter ilə səliqəyə salırıq
    const formattedLetters = letters.map((letter) => formatLetter(letter));

    // 3. Cavabı göndər
    return res.status(200).json({
      count: letters.length,
      letters: formattedLetters,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// POST /api/letters — yeni məktub
export const createLetter = async (req, res) => {
  try {
    const { title, message, recipientId } = req.body;

    // 1. Başlıq və mətn boşdursa, xəta qaytar
    if (!title || title.trim() === "") {
      return res.status(400).json({
        message: "Letter title is required",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Letter message is required",
      });
    }

    // 2. Çox uzundursa, xəta qaytar
    if (title.trim().length > TITLE_MAX_LENGTH) {
      return res.status(400).json({
        message: `Title can be at most ${TITLE_MAX_LENGTH} characters`,
      });
    }

    if (message.trim().length > MESSAGE_MAX_LENGTH) {
      return res.status(400).json({
        message: `Message can be at most ${MESSAGE_MAX_LENGTH} characters`,
      });
    }

    // 3. Alıcının ID-si düzgün formatdadırmı?
    if (!mongoose.isValidObjectId(recipientId)) {
      return res.status(400).json({
        message: "Invalid recipient ID",
      });
    }

    // 4. Özünə məktub yazmaq olmaz
    if (recipientId === req.userId) {
      return res.status(400).json({
        message: "You cannot write a letter to yourself",
      });
    }

    // 5. Alıcı bazada mövcuddurmu?
    const recipientExists = await User.exists({ _id: recipientId });

    if (!recipientExists) {
      return res.status(404).json({
        message: "Recipient not found",
      });
    }

    // 6. Məktubu yarat.
    //    author-u body-dən YOX, token-dən (req.userId) götürürük.
    //    Belə olmasa, kimsə başqasının adından məktub yaza bilər.
    const letter = await Letter.create({
      title: title.trim(),
      message: message.trim(),
      author: req.userId,
      recipient: recipientId,
    });

    // 7. Göndərən və alıcının adlarını əlavə et
    await letter.populate([
      { path: "author", select: "name" },
      { path: "recipient", select: "name" },
    ]);

    // 8. Cavabı göndər
    return res.status(201).json({
      message: "Letter created successfully",
      letter: formatLetter(letter),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
