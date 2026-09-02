/**
 * Automated test script for Phase 6: Admin Borrowing Management
 */
const assert = require("assert");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const Book = require("../models/Book");
const Borrowing = require("../models/Borrowing");
const {
    getAllBorrowings,
    adminReturnBook,
} = require("../controllers/adminBorrowingControllers");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

console.log("==================================================");
console.log("Running Phase 6: Admin Borrowing Management Tests...");
console.log("==================================================\n");

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
    let testMember = null;
    let testAdmin = null;
    let testBook = null;
    let testBorrowing = null;

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for testing.\n");

        // 1. Setup test data
        testMember = await User.create({
            username: "phase6TestMember",
            email: `phase6member_${Date.now()}@test.com`,
            password: "password123",
            role: "member",
        });

        testAdmin = await User.create({
            username: "phase6TestAdmin",
            email: `phase6admin_${Date.now()}@test.com`,
            password: "password123",
            role: "admin",
        });

        testBook = await Book.create({
            title: "Phase 6 Admin Borrowing Test Book",
            author: "Author Phase6",
            genre: "Testing",
            publisher: "Test Publisher",
            pageCount: 250,
            quantity: 5,
            availableQuantity: 4,
        });

        // 1. Test 1: Unauthenticated request -> 401
        await runTest("Security 1: Unauthenticated request rejected with 401", async () => {
            const req = { cookies: {} };
            const res = mockRes();
            let nextCalled = false;
            await isLoggedIn(req, res, () => {
                nextCalled = true;
            });
            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(nextCalled, false);
        });

        // 2. Test 2: Member request -> 403
        await runTest("Security 2: Member request rejected with 403 by isAdmin", async () => {
            const req = {
                user: { id: testMember._id.toString(), role: "member" },
            };
            const res = mockRes();
            let nextCalled = false;
            await isAdmin(req, res, () => {
                nextCalled = true;
            });
            assert.strictEqual(res.statusCode, 403);
            assert.strictEqual(nextCalled, false);
        });

        // 3. Test 3: Admin request -> 200
        await runTest("Security 3: Admin request allowed through isAdmin middleware", async () => {
            const req = {
                user: { id: testAdmin._id.toString(), role: "admin" },
            };
            const res = mockRes();
            let nextCalled = false;
            await isAdmin(req, res, () => {
                nextCalled = true;
            });
            assert.strictEqual(nextCalled, true);
        });

        // Create an overdue active borrowing record (2.5 days past due -> Math.ceil = 3 overdue days)
        const threeDaysDue = new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000);
        testBorrowing = await Borrowing.create({
            user: testMember._id,
            book: testBook._id,
            borrowedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
            dueDate: threeDaysDue,
            status: "Active",
            fine: 0,
        });

        // 4. Test 4: GET all borrowings returns populated fields & dynamic fine
        await runTest("Functional 1: getAllBorrowings returns records with derived fields and dynamic fine", async () => {
            const req = { user: { id: testAdmin._id.toString(), role: "admin" } };
            const res = mockRes();

            await getAllBorrowings(req, res);

            assert.strictEqual(res.statusCode, 200);
            assert.ok(Array.isArray(res.jsonData?.borrowings));

            const found = res.jsonData.borrowings.find(
                (b) => b._id.toString() === testBorrowing._id.toString()
            );
            assert.ok(found, "Test borrowing must be returned in list");
            assert.strictEqual(found.status, "Active");
            assert.strictEqual(found.isOverdue, true);
            assert.strictEqual(found.overdueDays, 3);
            assert.strictEqual(found.currentFine, 150); // 3 days * 50 = 150
            assert.strictEqual(found.fine, 0); // DB fine remains 0 while active
            assert.strictEqual(found.user?.username, "phase6TestMember");
            assert.strictEqual(found.book?.title, "Phase 6 Admin Borrowing Test Book");
        });

        // 5. Test 5: Admin returns the overdue book
        await runTest("Functional 2: adminReturnBook returns book, finalizes fine and increments availableQuantity", async () => {
            const req = {
                params: { id: testBorrowing._id.toString() },
                user: { id: testAdmin._id.toString(), role: "admin" },
            };
            const res = mockRes();

            await adminReturnBook(req, res);

            assert.strictEqual(res.statusCode, 200);
            const returnedDoc = res.jsonData?.borrowing;
            assert.ok(returnedDoc);
            assert.strictEqual(returnedDoc.status, "Returned");
            assert.strictEqual(returnedDoc.fine, 150); // Permanent fine recorded
            assert.strictEqual(returnedDoc.currentFine, 150);
            assert.strictEqual(returnedDoc.isOverdue, false);
            assert.strictEqual(returnedDoc.overdueDays, 0);
            assert.ok(returnedDoc.returnedAt);

            // Verify Book availableQuantity incremented from 4 to 5
            const updatedBook = await Book.findById(testBook._id);
            assert.strictEqual(updatedBook.availableQuantity, 5);
            assert.ok(
                updatedBook.availableQuantity <= updatedBook.quantity,
                "availableQuantity must not exceed quantity"
            );
        });

        // 6. Test 6: Re-return attempt is rejected
        await runTest("Functional 3: Returning an already returned borrowing returns 400", async () => {
            const req = {
                params: { id: testBorrowing._id.toString() },
                user: { id: testAdmin._id.toString(), role: "admin" },
            };
            const res = mockRes();

            await adminReturnBook(req, res);

            assert.strictEqual(res.statusCode, 400);
            assert.strictEqual(res.jsonData?.message, "This book has already been returned.");
        });

        console.log(`\n==================================================`);
        console.log(`Phase 6 tests: ${passed}/${total} passed.`);
        console.log(`==================================================`);

    } catch (err) {
        console.error("Test error:", err);
    } finally {
        // Clean up test documents
        if (testBorrowing) await Borrowing.findByIdAndDelete(testBorrowing._id);
        if (testBook) await Book.findByIdAndDelete(testBook._id);
        if (testMember) await User.findByIdAndDelete(testMember._id);
        if (testAdmin) await User.findByIdAndDelete(testAdmin._id);

        await mongoose.disconnect();
        process.exit(passed === total ? 0 : 1);
    }
};

runAll();
