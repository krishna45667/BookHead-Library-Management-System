const mongoose = require("mongoose");

const borrowingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
        required: true,
    },
    borrowedAt: {
        type: Date,
        default: Date.now,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    returnedAt: {
        type: Date,
        default: null,
    },
    status: {
        type: String,
        enum: ["Active", "Returned"],
        default: "Active",
    },
    fine: {
        type: Number,
        default: 0,
        min: 0,
    },
});

const Borrowing = mongoose.model("Borrowing", borrowingSchema);

module.exports = Borrowing;
