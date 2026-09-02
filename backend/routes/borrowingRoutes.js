const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");

const {
    borrowBook,
    returnBook,
    getMyBorrowings,
} = require("../controllers/borrowingControllers");

router.get("/my", isLoggedIn, getMyBorrowings);
router.post("/:bookId", isLoggedIn, borrowBook);
router.patch("/:id/return", isLoggedIn, returnBook);

module.exports = router;
