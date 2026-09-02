/**
 * Automated test script for Phase 5: Admin Dashboard Security & Metrics
 */
const assert = require("assert");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const Book = require("../models/Book");
const Borrowing = require("../models/Borrowing");
const { getDashboardStats } = require("../controllers/dashboardControllers");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

console.log("=========================================");
console.log("Running Phase 5: Admin Dashboard Tests...");
console.log("=========================================\n");

let passed = 0;
let total = 0;

const runTest = async (name, fn) => {
    total++;
    try {
        await fn();
        console.log(`✅ [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`❌ [FAIL] ${name}`);
        console.error(err);
    }
};

const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.jsonData = null;
    res.status = function (code) {
        this.statusCode = code;
        return this;
    };
    res.json = function (data) {
        this.jsonData = data;
        return this;
    };
    return res;
};

const runAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for testing.\n");

        // 1. Test unauthenticated request
        await runTest("Security 1: Unauthenticated request rejected with 401", async () => {
            const req = { cookies: {} };
            const res = mockRes();
            let nextCalled = false;
            await isLoggedIn(req, res, () => {
                nextCalled = true;
            });
            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(nextCalled, false);
            assert.ok(res.jsonData?.message);
        });

        // 2. Test member request rejected by isAdmin middleware
        await runTest("Security 2: Member token rejected by isAdmin with 403", async () => {
            // Find or mock a member user
            let member = await User.findOne({ role: "member" });
            if (!member) {
                member = await User.create({
                    username: "tempMemberTest",
                    email: "tempmember@example.com",
                    password: "password123",
                    role: "member",
                });
            }

            const token = jwt.sign(
                { id: member._id, email: member.email, role: member.role },
                process.env.JWT_SECRET
            );

            const req = {
                cookies: { token },
                user: { id: member._id.toString(), role: "member" },
            };
            const res = mockRes();
            let nextCalled = false;

            await isAdmin(req, res, () => {
                nextCalled = true;
            });

            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(nextCalled, false);
            assert.strictEqual(res.jsonData?.message, "Access denied. Admin privileges required.");
        });

        // 3. Test admin request allowed by isAdmin middleware
        await runTest("Security 3: Admin token allowed through isAdmin middleware", async () => {
            let admin = await User.findOne({ role: "admin" });
            if (!admin) {
                admin = await User.create({
                    username: "tempAdminTest",
                    email: "tempadmin@example.com",
                    password: "password123",
                    role: "admin",
                });
            }

            const req = {
                user: { id: admin._id.toString(), role: "admin" },
            };
            const res = mockRes();
            let nextCalled = false;

            await isAdmin(req, res, () => {
                nextCalled = true;
            });

            assert.strictEqual(nextCalled, true);
        });

        // 4. Test getDashboardStats returns real DB metrics with all required fields
        await runTest("Functional: getDashboardStats returns all 8 required metrics accurately", async () => {
            const req = {};
            const res = mockRes();

            await getDashboardStats(req, res);

            assert.strictEqual(res.statusCode, 200);
            const stats = res.jsonData;
            assert.ok(stats, "Stats response must exist");

            console.log("   Current DB Statistics:", JSON.stringify(stats, null, 2));

            // Verify all 8 fields exist and are non-negative numbers
            const requiredFields = [
                "totalBooks",
                "totalCopies",
                "availableCopies",
                "borrowedCopies",
                "totalMembers",
                "activeLoans",
                "overdueLoans",
                "totalFines",
            ];

            for (const field of requiredFields) {
                assert.ok(
                    stats[field] !== undefined,
                    `Field ${field} must be present in response`
                );
                assert.strictEqual(
                    typeof stats[field],
                    "number",
                    `Field ${field} must be a number`
                );
                assert.ok(
                    stats[field] >= 0,
                    `Field ${field} must be non-negative (got ${stats[field]})`
                );
            }

            // Verify borrowedCopies consistency: totalCopies - availableCopies
            assert.strictEqual(
                stats.borrowedCopies,
                stats.totalCopies - stats.availableCopies,
                "borrowedCopies must equal totalCopies - availableCopies"
            );
        });

        console.log(`\n=========================================`);
        console.log(`Dashboard tests: ${passed}/${total} passed.`);
        console.log(`=========================================`);

        await mongoose.disconnect();
        process.exit(passed === total ? 0 : 1);
    } catch (err) {
        console.error("Test execution failed:", err);
        process.exit(1);
    }
};

runAll();
