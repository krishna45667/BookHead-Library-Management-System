const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    publisher: {
        type: String,
        required: true,
    },
    pageCount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Available", "Borrowed"],
        default: "Available",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;