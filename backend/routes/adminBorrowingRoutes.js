const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");
const {
    getAllBorrowings,
    adminReturnBook,
} = require("../controllers/adminBorrowingControllers");

// Admin Only: Get all library borrowings
router.get("/", isLoggedIn, isAdmin, getAllBorrowings);

// Admin Only: Return a borrowing on behalf of a member
router.patch("/:id/return", isLoggedIn, isAdmin, adminReturnBook);

module.exports = router;
