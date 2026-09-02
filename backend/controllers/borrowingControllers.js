const mongoose = require("mongoose");
const Borrowing = require("../models/Borrowing");
const Book = require("../models/Book");
const {
    calculateOverdueDays,
    calculateFine,
    formatBorrowingWithFine,
} = require("../utils/fineUtils");

// Fixed borrowing period: 14 days
const BORROWING_PERIOD_DAYS = 14;

const borrowBook = async (req, res) => {
    try {
        const { bookId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(bookId)) {
            return res.status(400).json({
                message: "Invalid Book ID format",
            });
        }

        // 1. Verify that the requested book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        // 2. Check if the user already has an active borrowing for this book
        const existingActiveBorrowing = await Borrowing.findOne({
            user: req.user.id,
            book: bookId,
            status: "Active",
        });

        if (existingActiveBorrowing) {
            return res.status(400).json({
                message: "You already have an active borrowing for this book.",
            });
        }

        // 3. Check if copies are available
        if (book.availableQuantity <= 0) {
            return res.status(400).json({
                message: "No copies of this book are currently available.",
            });
        }

        // 4. Atomically decrement availableQuantity to handle race conditions
        const updatedBook = await Book.findOneAndUpdate(
            { _id: bookId, availableQuantity: { $gt: 0 } },
            { $inc: { availableQuantity: -1 } },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(400).json({
                message: "No copies of this book are currently available.",
            });
        }

        // 5. Calculate due date
        const borrowedAt = new Date();
        const dueDate = new Date(
            borrowedAt.getTime() + BORROWING_PERIOD_DAYS * 24 * 60 * 60 * 1000
        );

        // 6. Create the Borrowing document (with rollback if creation fails)
        let borrowing;
        try {
            borrowing = await Borrowing.create({
                user: req.user.id,
                book: bookId,
                borrowedAt,
                dueDate,
                status: "Active",
                fine: 0,
            });
        } catch (createErr) {
            // Rollback: restore the decremented availableQuantity
            await Book.findByIdAndUpdate(bookId, {
                $inc: { availableQuantity: 1 },
            });
            throw createErr;
        }

        // 7. Populate book and user details (safe fields only)
        await borrowing.populate([
            {
                path: "book",
                select: "title author genre publisher pageCount quantity availableQuantity",
            },
            {
                path: "user",
                select: "username email",
            },
        ]);

        return res.status(201).json({
            message: "Book borrowed successfully",
            borrowing: formatBorrowingWithFine(borrowing),
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const returnBook = async (req, res) => {
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

        // 2. Verify that the authenticated user owns this borrowing record
        if (borrowing.user.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied. You can only return your own borrowed books.",
            });
        }

        // 3. Verify that the status is currently Active
        if (borrowing.status === "Returned") {
            return res.status(400).json({
                message: "This book has already been returned.",
            });
        }

        // 4. Determine overdue days and finalize fine at return time
        const returnedAt = new Date();
        const overdueDays = calculateOverdueDays(borrowing.dueDate, returnedAt);
        const finalFine = calculateFine(overdueDays);

        // 5. Update the borrowing record permanently
        borrowing.status = "Returned";
        borrowing.returnedAt = returnedAt;
        borrowing.fine = finalFine;
        await borrowing.save();

        // 6. Atomically increment the associated Book availableQuantity
        await Book.findByIdAndUpdate(borrowing.book, {
            $inc: { availableQuantity: 1 },
        });

        // 7. Populate book and user info
        await borrowing.populate([
            {
                path: "book",
                select: "title author genre publisher pageCount quantity availableQuantity",
            },
            {
                path: "user",
                select: "username email",
            },
        ]);

        return res.status(200).json({
            message: "Book returned successfully",
            borrowing: formatBorrowingWithFine(borrowing),
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const getMyBorrowings = async (req, res) => {
    try {
        const borrowings = await Borrowing.find({ user: req.user.id })
            .populate(
                "book",
                "title author genre publisher pageCount quantity availableQuantity"
            )
            .sort({ borrowedAt: -1 });

        const formattedBorrowings = borrowings.map(formatBorrowingWithFine);

        return res.status(200).json({
            borrowings: formattedBorrowings,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = {
    borrowBook,
    returnBook,
    getMyBorrowings,
};
