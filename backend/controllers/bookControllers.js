const Book = require("../models/Book");

const addBook = async (req, res) => {
    try {
        const {
            title,
            author,
            genre,
            publisher,
            pageCount,
            quantity,
        } = req.body;

        if (
            !title ||
            !author ||
            !genre ||
            !publisher ||
            !pageCount
        ) {
            return res.status(400).json({
                message: "Please fill out all the Details",
            });
        }

        const parsedPageCount = Number(pageCount);
        if (isNaN(parsedPageCount) || parsedPageCount <= 0) {
            return res.status(400).json({
                message: "Page count must be a positive number",
            });
        }

        const parsedQuantity = quantity !== undefined ? Number(quantity) : 1;
        if (isNaN(parsedQuantity) || parsedQuantity < 0) {
            return res.status(400).json({
                message: "Quantity must be a non-negative number",
            });
        }

        const book = await Book.create({
            title,
            author,
            genre,
            publisher,
            pageCount: parsedPageCount,
            quantity: parsedQuantity,
            availableQuantity: parsedQuantity,
        });

        return res.status(201).json({
            message: "Book Added Successfully",
            book,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const getBooks = async (req, res) => {
    try {
        const books = await Book.find();

        return res.status(200).json({
            books,
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        const {
            title,
            author,
            genre,
            publisher,
            pageCount,
            quantity,
        } = req.body;

        if (title !== undefined) book.title = title;
        if (author !== undefined) book.author = author;
        if (genre !== undefined) book.genre = genre;
        if (publisher !== undefined) book.publisher = publisher;

        if (pageCount !== undefined) {
            const parsedPageCount = Number(pageCount);
            if (isNaN(parsedPageCount) || parsedPageCount <= 0) {
                return res.status(400).json({
                    message: "Page count must be a positive number",
                });
            }
            book.pageCount = parsedPageCount;
        }

        if (quantity !== undefined) {
            const newQuantity = Number(quantity);
            if (isNaN(newQuantity) || newQuantity < 0) {
                return res.status(400).json({
                    message: "Quantity must be a non-negative number",
                });
            }

            const currentQuantity = book.quantity ?? 1;
            const currentAvailable = book.availableQuantity ?? currentQuantity;
            const unavailableCopies = Math.max(0, currentQuantity - currentAvailable);

            if (newQuantity < unavailableCopies) {
                return res.status(400).json({
                    message: `Cannot reduce quantity to ${newQuantity}. There are currently ${unavailableCopies} unavailable (borrowed) copies.`,
                });
            }

            book.quantity = newQuantity;
            book.availableQuantity = newQuantity - unavailableCopies;
        }

        await book.save();

        return res.status(200).json({
            message: "Book Updated Successfully",
            book,
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        return res.status(200).json({
            message: "Book Deleted Successfully",
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = {
    addBook,
    getBooks,
    updateBook,
    deleteBook,
};
