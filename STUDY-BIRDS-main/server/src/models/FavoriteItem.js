const mongoose = require("mongoose");

const favoriteItemSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ["university", "program"],
      required: true,
      index: true,
    },
    university: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
    },
    notes: String,
  },
  { timestamps: true }
);

favoriteItemSchema.index({ student: 1, itemType: 1, university: 1 }, { unique: true, partialFilterExpression: { itemType: "university" } });
favoriteItemSchema.index({ student: 1, itemType: 1, program: 1 }, { unique: true, partialFilterExpression: { itemType: "program" } });

module.exports = mongoose.model("FavoriteItem", favoriteItemSchema);
