const Book = require("../models/Book");
const User = require("../models/user");
const Borrowing = require("../models/Borrowing");
const { calculateOverdueDays, calculateFine } = require("../utils/fineUtils");

/**
 * Get Real-Time Dashboard Statistics (Admin Only)
 *
 * Metrics returned:
 * - totalBooks: Number of book/title documents in Book collection
 * - totalCopies: Sum of quantity across all books
 * - availableCopies: Sum of availableQuantity across all books
 * - borrowedCopies: totalCopies - availableCopies
 * - totalMembers: Number of users with role "member" (excluding admins)
 * - activeLoans: Number of active Borrowing documents (status === "Active")
 * - overdueLoans: Number of active borrowings where dueDate < current time
 * - totalFines: Sum of permanent fines on returned loans + dynamic fines on active overdue loans
 */
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();

        const [
            totalBooks,
            bookAggregation,
            totalMembers,
            activeLoans,
            overdueLoans,
            returnedFinesAggregation,
            activeOverdueBorrowings,
        ] = await Promise.all([
            // 1. Total unique book titles
            Book.countDocuments(),

            // 2. Sum of total and available copies across all books
            Book.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCopies: { $sum: "$quantity" },
                        availableCopies: { $sum: "$availableQuantity" },
                    },
                },
            ]),

            // 3. Total registered members (excluding admin accounts)
            User.countDocuments({ role: "member" }),

            // 4. Active loans count
            Borrowing.countDocuments({ status: "Active" }),

            // 5. Active overdue loans count (status is Active and dueDate < now)
            Borrowing.countDocuments({
                status: "Active",
                dueDate: { $lt: now },
            }),

            // 6. Sum of permanent fines on returned borrowings
            Borrowing.aggregate([
                { $match: { status: "Returned" } },
                {
                    $group: {
                        _id: null,
                        totalReturnedFines: { $sum: "$fine" },
                    },
                },
            ]),

            // 7. Active overdue borrowings to calculate current dynamic fine
            Borrowing.find(
                {
                    status: "Active",
                    dueDate: { $lt: now },
                },
                "dueDate"
            ),
        ]);

        const totalCopies = bookAggregation[0]?.totalCopies || 0;
        const availableCopies = bookAggregation[0]?.availableCopies || 0;
        const borrowedCopies = Math.max(0, totalCopies - availableCopies);
        const returnedFines = returnedFinesAggregation[0]?.totalReturnedFines || 0;

        // Calculate active overdue fines dynamically using fineUtils logic
        const activeFines = activeOverdueBorrowings.reduce((acc, borrowing) => {
            const overdueDays = calculateOverdueDays(borrowing.dueDate, now);
            return acc + calculateFine(overdueDays);
        }, 0);

        const totalFines = returnedFines + activeFines;

        return res.status(200).json({
            totalBooks,
            totalCopies,
            availableCopies,
            borrowedCopies,
            totalMembers,
            activeLoans,
            overdueLoans,
            totalFines,
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "Failed to fetch dashboard statistics",
        });
    }
};

module.exports = {
    getDashboardStats,
};
