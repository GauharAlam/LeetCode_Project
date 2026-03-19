const mongoose = require("mongoose");
const { Schema } = mongoose;

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    },
    content: {
        type: String,
        default: "",
    }
}, { timestamps: true });

// Ensure one note per user per problem
noteSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
