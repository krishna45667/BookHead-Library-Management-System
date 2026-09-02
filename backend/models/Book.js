const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true,
    },
    genre: {
        type: String,
        required: true,
        trim: true,
    },
    publisher: {
        type: String,
        required: true,
        trim: true,
    },
    pageCount: {
        type: Number,
        required: true,
        min: 1,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 1,
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 1,
    },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;