const Book = require("../models/Book");
const addBook = async (req, res) => {
    try{
        const {
            title,
            author,
            genre,
            publisher,
            pageCount,
        } = req.body;

        if (
            !title ||
            !author ||
            !genre ||
            !publisher ||
            !pageCount
        ){
            return res.status(400).json({
                message: "Please fill out all the Details"
            })
        }

        const book = await Book.create({
            title,
            author,
            genre,
            publisher,
            pageCount,
            owner: req.user.id,
        })

        return res.status(201).json({
            message: "Book Added Successfully",
            book,
        });
    }catch(err){
        return res.status(500).json({
            message:err.message,
        })
    }
};

const getBooks = async (req, res) => {
    try {

        const books = await Book.find({
            owner: req.user.id,
        });

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
        const book = await Book.findOneAndUpdate(
            {
                _id: req.params.id,
                owner: req.user.id,
            },
            req.body,
            {
                new: true,
            }
        );
        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }
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

        const book = await Book.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id,
        });

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

const toggleBookStatus = async (req, res) => {
    try {
        const book = await Book.findOne({
            _id: req.params.id,
            owner: req.user.id,
        });

        if (!book) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        book.status =
            book.status === "Available"
                ? "Borrowed"
                : "Available";

        await book.save();

        return res.status(200).json({
            message: `Book marked as ${book.status}`,
            book,
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
    toggleBookStatus,
};