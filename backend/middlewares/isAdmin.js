const User = require("../models/user");

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Authentication required. Please login first.",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin privileges required.",
            });
        }

        next();
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

module.exports = isAdmin;
