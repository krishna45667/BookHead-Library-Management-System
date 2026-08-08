const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");

const {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
} = require("../controllers/authControllers");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", isLoggedIn, getCurrentUser);
router.post("/logout", logoutUser);

module.exports = router;