/**
 * Automated test script for Phase 4 Overdue & Fines calculations
 */
const assert = require("assert");
const {
    FINE_PER_DAY,
    calculateOverdueDays,
    calculateFine,
    formatBorrowingWithFine,
} = require("../utils/fineUtils");

console.log("=========================================");
console.log("Running Phase 4: Overdue & Fines Tests...");
console.log("=========================================\n");

let passed = 0;
let total = 0;

const runTest = (name, fn) => {
    total++;
    try {
        fn();
        console.log(`✅ [PASS] ${name}`);
        passed++;
    } catch (err) {
        console.error(`❌ [FAIL] ${name}`);
        console.error(err);
    }
};

// Test 1: Verify FINE_PER_DAY constant
runTest("Rule 1: FINE_PER_DAY constant is ₹50", () => {
    assert.strictEqual(FINE_PER_DAY, 50);
});

// Test 2: Active borrowing before due date (on-time)
runTest("Test A: Active borrowing before due date (isOverdue=false, overdueDays=0, currentFine=0)", () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days in future
    const borrowing = {
        _id: "test1",
        status: "Active",
        dueDate: futureDate,
        fine: 0,
        returnedAt: null,
    };

    const formatted = formatBorrowingWithFine(borrowing);
    assert.strictEqual(formatted.status, "Active");
    assert.strictEqual(formatted.isOverdue, false);
    assert.strictEqual(formatted.overdueDays, 0);
    assert.strictEqual(formatted.currentFine, 0);
    assert.strictEqual(formatted.fine, 0);
});

// Test 3: Active borrowing after due date (3 days overdue)
runTest("Test B: Active borrowing after due date (isOverdue=true, overdueDays=3, currentFine=150)", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const borrowing = {
        _id: "test2",
        status: "Active",
        dueDate: threeDaysAgo,
        fine: 0,
        returnedAt: null,
    };

    const formatted = formatBorrowingWithFine(borrowing);
    assert.strictEqual(formatted.status, "Active");
    assert.strictEqual(formatted.isOverdue, true);
    assert.strictEqual(formatted.overdueDays, 3);
    assert.strictEqual(formatted.currentFine, 150); // 3 * 50 = 150
    assert.strictEqual(formatted.fine, 0); // DB fine field remains 0 while active
});

// Test 4: Returning an overdue borrowing
runTest("Test C: Returning an overdue borrowing (status=Returned, fine=150, currentFine=150, isOverdue=false)", () => {
    const dueDate = new Date("2026-01-01T00:00:00Z");
    const returnedAt = new Date("2026-01-04T00:00:00Z"); // 3 days after due date

    const overdueDays = calculateOverdueDays(dueDate, returnedAt);
    const finalFine = calculateFine(overdueDays);

    assert.strictEqual(overdueDays, 3);
    assert.strictEqual(finalFine, 150);

    const returnedBorrowing = {
        _id: "test3",
        status: "Returned",
        dueDate,
        returnedAt,
        fine: finalFine,
    };

    const formatted = formatBorrowingWithFine(returnedBorrowing);
    assert.strictEqual(formatted.status, "Returned");
    assert.strictEqual(formatted.fine, 150);
    assert.strictEqual(formatted.currentFine, 150);
    assert.strictEqual(formatted.isOverdue, false);
    assert.strictEqual(formatted.overdueDays, 0);
});

// Test 5: Returning on-time borrowing
runTest("Test D: Returning before due date (fine=0, currentFine=0)", () => {
    const dueDate = new Date("2026-01-14T00:00:00Z");
    const returnedAt = new Date("2026-01-10T00:00:00Z"); // 4 days before due date

    const overdueDays = calculateOverdueDays(dueDate, returnedAt);
    const finalFine = calculateFine(overdueDays);

    assert.strictEqual(overdueDays, 0);
    assert.strictEqual(finalFine, 0);

    const returnedBorrowing = {
        _id: "test4",
        status: "Returned",
        dueDate,
        returnedAt,
        fine: finalFine,
    };

    const formatted = formatBorrowingWithFine(returnedBorrowing);
    assert.strictEqual(formatted.status, "Returned");
    assert.strictEqual(formatted.fine, 0);
    assert.strictEqual(formatted.currentFine, 0);
    assert.strictEqual(formatted.isOverdue, false);
});

// Test 6: Returned borrowing fine does not increase over time
runTest("Test E: Returned borrowing fine does not change based on current date", () => {
    const oldDueDate = new Date("2025-01-01T00:00:00Z");
    const oldReturnedAt = new Date("2025-01-03T00:00:00Z"); // 2 days overdue -> 100
    const storedFine = 100;

    const returnedBorrowing = {
        _id: "test5",
        status: "Returned",
        dueDate: oldDueDate,
        returnedAt: oldReturnedAt,
        fine: storedFine,
    };

    // Even though current date is far in the future, fine must remain exactly storedFine
    const formatted = formatBorrowingWithFine(returnedBorrowing);
    assert.strictEqual(formatted.status, "Returned");
    assert.strictEqual(formatted.fine, 100);
    assert.strictEqual(formatted.currentFine, 100);
    assert.strictEqual(formatted.isOverdue, false);
    assert.strictEqual(formatted.overdueDays, 0);
});

console.log(`\n=========================================`);
console.log(`Tests finished: ${passed}/${total} passed.`);
console.log(`=========================================`);

if (passed !== total) {
    process.exit(1);
}
