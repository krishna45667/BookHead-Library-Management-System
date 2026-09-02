const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");
const { getDashboardStats } = require("../controllers/dashboardControllers");

// Admin only: Get real-time library dashboard metrics
router.get("/stats", isLoggedIn, isAdmin, getDashboardStats);

module.exports = router;
