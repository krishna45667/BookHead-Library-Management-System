const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

const {
    addBook,
    getBooks,
    updateBook,
    deleteBook,
} = require("../controllers/bookControllers");

router.post("/", isLoggedIn, isAdmin, addBook);
router.get("/", isLoggedIn, getBooks);
router.put("/:id", isLoggedIn, isAdmin, updateBook);
router.delete("/:id", isLoggedIn, isAdmin, deleteBook);

module.exports = router;