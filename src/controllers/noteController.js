import mongoose from "mongoose";
import Note from "../models/Note.js";

// Bazadan gələn notu frontend üçün səliqəli obyektə çevirir
const formatNote = (note) => {
  // Müəllifin hesabı silinibsə, note.author null olur.
  // Ona görə əvvəlcə yoxlayırıq ki, xəta almayaq.
  let author = null;

  if (note.author) {
    author = {
      id: note.author._id,
      name: note.author.name,
    };
  }

  return {
    id: note._id,
    text: note.text,
    author: author,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  };
};

// GET /api/notes — bütün notlar
export const getNotes = async (req, res) => {
  try {
    // 1. Bütün notları götür (ən yenisi əvvəl).
    //    populate: author-dakı ID-nin yerinə istifadəçinin adını gətirir.
    const notes = await Note.find()
      .sort({ createdAt: -1 })
      .populate("author", "name");

    // 2. Hər notu formatNote ilə səliqəyə salırıq
    const formattedNotes = notes.map((note) => formatNote(note));

    // 3. Cavabı göndər
    return res.status(200).json({
      count: notes.length,
      notes: formattedNotes,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// POST /api/notes — yeni not
export const createNote = async (req, res) => {
  try {
    const { text } = req.body;

    // 1. Mətn boşdursa, xəta qaytar
    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Note text is required",
      });
    }

    // 2. Mətn çox uzundursa, xəta qaytar
    if (text.trim().length > 500) {
      return res.status(400).json({
        message: "Note can be at most 500 characters",
      });
    }

    // 3. Notu yarat.
    //    author-u body-dən YOX, token-dən (req.userId) götürürük.
    //    Belə olmasa, kimsə başqasının adından not yaza bilər.
    const note = await Note.create({
      text: text.trim(),
      author: req.userId,
    });

    // 4. Müəllifin adını notun içinə əlavə et
    await note.populate("author", "name");

    // 5. Cavabı göndər
    return res.status(201).json({
      message: "Note created successfully",
      note: formatNote(note),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// PUT /api/notes/:id — notu dəyiş
export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    // 1. ID düzgün formatdadırmı?
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    // 2. Mətn boşdursa, xəta qaytar
    if (!text || text.trim() === "") {
      return res.status(400).json({
        message: "Note text is required",
      });
    }

    // 3. Mətn çox uzundursa, xəta qaytar
    if (text.trim().length > 500) {
      return res.status(400).json({
        message: "Note can be at most 500 characters",
      });
    }

    // 4. Notu bazada tap
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // 5. Yalnız notu yazan şəxs onu dəyişə bilər.
    //    note.author ObjectId-dir, req.userId isə string.
    //    Müqayisə etmək üçün toString() ilə string-ə çeviririk.
    if (note.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only edit your own notes",
      });
    }

    // 6. Yeni mətni yaz və yadda saxla
    note.text = text.trim();
    await note.save();

    // 7. Müəllifin adını əlavə et və cavabı göndər
    await note.populate("author", "name");

    return res.status(200).json({
      message: "Note updated successfully",
      note: formatNote(note),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// DELETE /api/notes/:id — notu sil
export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. ID düzgün formatdadırmı?
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid note ID",
      });
    }

    // 2. Notu bazada tap
    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    // 3. Yalnız notu yazan şəxs onu silə bilər
    if (note.author.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete your own notes",
      });
    }

    // 4. Sil
    await note.deleteOne();

    return res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
