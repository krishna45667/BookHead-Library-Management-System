const mongoose = require("mongoose");
const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const {
    calculateOverdueDays,
    calculateFine,
    formatBorrowingWithFine,
} = require("../utils/fineUtils");

/**
 * Get All Library Borrowings (Admin Only)
 *
 * Returns all borrowing records in the library, populated with member and book details.
 * Derived fields: isOverdue, overdueDays, currentFine.
 */
const getAllBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find()
            .populate("user", "username email role")
            .populate("book", "title author genre")
            .sort({ borrowedAt: -1 });

        const formattedBorrowings = borrowings.map(formatBorrowingWithFine);

        return res.status(200).json({
            borrowings: formattedBorrowings,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch borrowing records",
        });
    }
};

/**
 * Admin Return Book (Admin Only)
 *
 * Allows an administrator to return an active borrowing on behalf of a member.
 * - Finalizes the fine at the time of return
 * - Sets status = "Returned" and returnedAt = current time
 * - Atomically increments the associated Book availableQuantity without exceeding total quantity
 */
const adminReturnBook = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid Borrowing ID format",
            });
        }

        // 1. Find the borrowing record
        const borrowing = await Borrowing.findById(id);
        if (!borrowing) {
            return res.status(404).json({
                message: "Borrowing record not found",
            });
        }

        // 2. Validate that borrowing is currently Active
        if (borrowing.status === "Returned") {
            return res.status(400).json({
                message: "This book has already been returned.",
            });
        }

        // 3. Determine overdue days and finalize fine at return time
        const returnedAt = new Date();
        const overdueDays = calculateOverdueDays(borrowing.dueDate, returnedAt);
        const finalFine = calculateFine(overdueDays);

        // 4. Update the borrowing record permanently
        borrowing.status = "Returned";
        borrowing.returnedAt = returnedAt;
        borrowing.fine = finalFine;
        await borrowing.save();

        // 5. Atomically increment the associated Book availableQuantity (capped at quantity)
        await Book.findOneAndUpdate(
            {
                _id: borrowing.book,
                $expr: { $lt: ["$availableQuantity", "$quantity"] },
            },
            { $inc: { availableQuantity: 1 } }
        );

        // 6. Populate book and user info for response
        await borrowing.populate([
            {
                path: "book",
                select: "title author genre",
            },
            {
                path: "user",
                select: "username email role",
            },
        ]);

        return res.status(200).json({
            message: "Book returned successfully by admin",
            borrowing: formatBorrowingWithFine(borrowing),
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to return book",
        });
    }
};

module.exports = {
    getAllBorrowings,
    adminReturnBook,
};
