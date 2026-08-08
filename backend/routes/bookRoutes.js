const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");

const {
    addBook,
    getBooks,
    updateBook,
    deleteBook,
    toggleBookStatus
} = require("../controllers/bookControllers");

router.post("/", isLoggedIn, addBook);
router.get("/", isLoggedIn, getBooks);
router.put("/:id", isLoggedIn, updateBook);
router.delete("/:id", isLoggedIn, deleteBook);
router.patch("/:id/status", isLoggedIn, toggleBookStatus);
module.exports = router;