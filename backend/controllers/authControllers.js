const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password,10);

        const user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            dob: req.body.dob,
        })

        res.status(201).json({
            message: "User registered successfully",
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};
const loginUser = async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email,
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid Email or Password",
            });
        }
        const isMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password",
            });
        }
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
            },
            process.env.JWT_SECRET
        );
        res.cookie("token", token);
        return res.status(200).json({
            message: "Login Successful",
            user,
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        return res.status(200).json({
            user,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out Successfully",
    });
};

module.exports= {registerUser,loginUser,getCurrentUser,logoutUser}