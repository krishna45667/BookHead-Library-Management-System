/**
 * BookHead Library Management System - Fine & Overdue Utilities
 *
 * Business Rules:
 * - Standard fine rate: ₹50 per overdue day.
 * - An active borrowing is overdue when current time > dueDate.
 * - Overdue days calculation:
 *   Elapsed time is calculated as the number of calendar days or 24-hour periods
 *   past the due date (using Math.ceil so that any time beyond dueDate enters day 1 of overdue).
 *   Never negative (minimum 0).
 * - For Active loans: fine is calculated dynamically at runtime (currentFine = overdueDays * FINE_PER_DAY).
 *   Database fine remains 0.
 * - For Returned loans: the fine stored at the moment of return is finalized and permanent.
 *   isOverdue is false, overdueDays is 0, and currentFine equals the stored fine.
 */

const FINE_PER_DAY = 50;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculates non-negative overdue days between dueDate and a reference date (default: now).
 *
 * @param {Date|string} dueDate - The borrowing due date
 * @param {Date|string} [referenceDate=new Date()] - The comparison date (now or returnedAt)
 * @returns {number} Number of overdue days (0 if not overdue)
 */
const calculateOverdueDays = (dueDate, referenceDate = new Date()) => {
    if (!dueDate) return 0;

    const dueTime = new Date(dueDate).getTime();
    const refTime = new Date(referenceDate).getTime();
    const diffMs = refTime - dueTime;

    if (diffMs <= 0) return 0;

    // Use Math.ceil so entering a new 24-hour period counts as an overdue day
    return Math.ceil(diffMs / MS_PER_DAY);
};

/**
 * Calculates fine amount based on overdue days.
 *
 * @param {number} overdueDays - Number of days overdue
 * @returns {number} Fine amount in currency (₹)
 */
const calculateFine = (overdueDays) => {
    if (!overdueDays || overdueDays <= 0) return 0;
    return overdueDays * FINE_PER_DAY;
};

/**
 * Augments a borrowing record (Mongoose document or plain object) with derived fields:
 * - isOverdue (boolean)
 * - overdueDays (number)
 * - currentFine (number)
 *
 * @param {Object} borrowing - Mongoose document or plain object
 * @returns {Object} Plain object including original borrowing fields and derived overdue/fine fields
 */
const formatBorrowingWithFine = (borrowing) => {
    if (!borrowing) return null;

    const doc = borrowing.toObject ? borrowing.toObject() : { ...borrowing };

    if (doc.status === "Returned") {
        return {
            ...doc,
            isOverdue: false,
            overdueDays: 0,
            currentFine: doc.fine || 0,
        };
    }

    // Status is "Active":
    const overdueDays = calculateOverdueDays(doc.dueDate);
    const isOverdue = overdueDays > 0;
    const currentFine = calculateFine(overdueDays);

    return {
        ...doc,
        isOverdue,
        overdueDays,
        currentFine,
    };
};

module.exports = {
    FINE_PER_DAY,
    calculateOverdueDays,
    calculateFine,
    formatBorrowingWithFine,
};
