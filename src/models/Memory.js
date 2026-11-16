import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Xatirənin baş verdiyi gün (yüklənmə tarixi deyil)
    date: {
      type: Date,
      required: true,
    },

    // Cloudinary-dəki şəklin linki
    imageUrl: {
      type: String,
      required: true,
    },

    // Cloudinary-dəki şəklin ID-si — şəkli silmək üçün lazımdır
    imagePublicId: {
      type: String,
      required: true,
    },

    // Xatirəni kim əlavə edib
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;
