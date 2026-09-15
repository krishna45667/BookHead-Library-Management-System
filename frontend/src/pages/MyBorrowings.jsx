import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBookOpen, FaCalendarAlt, FaUndo, FaCheckCircle, FaClock, FaBook } from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

const MyBorrowings = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'returned'
    const [error, setError] = useState(null);

    const fetchBorrowings = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/borrowings/my`,
                { withCredentials: true }
            );
            setBorrowings(response.data.borrowings || []);
        } catch (err) {
            console.error("Failed to fetch borrowings:", err);
            setError(err.response?.data?.message || "Failed to load your borrowings.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const handleReturn = async (borrowingId, bookTitle) => {
        if (!window.confirm(`Are you sure you want to return "${bookTitle}"?`)) {
            return;
        }

        try {
            setReturningId(borrowingId);
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/borrowings/${borrowingId}/return`,
                {},
                { withCredentials: true }
            );

            alert(response.data.message || "Book returned successfully!");

            // Update record in place without full page refresh
            setBorrowings((prev) =>
                prev.map((item) =>
                    item._id === borrowingId
                        ? {
                              ...item,
                              status: "Returned",
                              returnedAt: response.data.borrowing?.returnedAt || new Date().toISOString(),
                          }
                        : item
                )
            );
        } catch (err) {
            alert(err.response?.data?.message || "Failed to return book");
        } finally {
            setReturningId(null);
        }
    };

    const activeBorrowings = borrowings.filter((b) => b.status === "Active");
    const returnedBorrowings = borrowings.filter((b) => b.status === "Returned");

    const filteredList =
        filter === "active"
            ? activeBorrowings
            : filter === "returned"
            ? returnedBorrowings
            : borrowings;

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isOverdue = (dueDate, status) => {
        if (status !== "Active" || !dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)]">
                <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                                My Borrowed Books
                            </h1>
                            <p className="text-zinc-400 mt-2">
                                Track your active loans, due dates, and borrowing history.
                            </p>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex items-center gap-3">
                            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-4 py-2 text-center">
                                <span className="text-xs text-zinc-400 block">Active Loans</span>
                                <span className="text-lg font-bold text-emerald-400">
                                    {activeBorrowings.length}
                                </span>
                            </div>
                            <div className="bg-zinc-800/80 border border-zinc-700/60 rounded-xl px-4 py-2 text-center">
                                <span className="text-xs text-zinc-400 block">Returned</span>
                                <span className="text-lg font-bold text-zinc-300">
                                    {returnedBorrowings.length}
                                </span>
                            </div>
                            {borrowings.some((b) => (b.currentFine || 0) > 0) && (
                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2 text-center">
                                    <span className="text-xs text-rose-400 block">Total Fines</span>
                                    <span className="text-lg font-bold text-rose-400">
                                        ₹{borrowings.reduce((sum, b) => sum + (b.currentFine || 0), 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-4 mb-6">
                        {[
                            { key: "all", label: `All (${borrowings.length})` },
                            { key: "active", label: `Active (${activeBorrowings.length})` },
                            { key: "returned", label: `Returned (${returnedBorrowings.length})` },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                                    filter === key
                                        ? "bg-amber-500 text-zinc-900 font-semibold"
                                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6">
                            {error}
                        </div>
                    )}

                    {/* Content */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-56 rounded-xl bg-zinc-800/40 border border-zinc-700/40 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/30 p-12 text-center text-zinc-400 max-w-lg mx-auto mt-8">
                            <FaBookOpen className="text-5xl text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-200 mb-1">
                                {filter === "active"
                                    ? "No active borrowings"
                                    : filter === "returned"
                                    ? "No returned books yet"
                                    : "You haven't borrowed any books yet"}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-6">
                                {filter === "active"
                                    ? "You have returned all your borrowed books."
                                    : "Explore the library collection to borrow your first title."}
                            </p>
                            <Link to="/books">
                                <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg text-sm transition cursor-pointer">
                                    Browse Library Books
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredList.map((item) => {
                                const book = item.book || {};
                                const isActive = item.status === "Active";
                                const overdue = item.isOverdue || isOverdue(item.dueDate, item.status);
                                const overdueDays = item.overdueDays || 0;
                                const fineAmount = item.currentFine !== undefined ? item.currentFine : (item.fine || 0);
                                const isReturning = returningId === item._id;

                                return (
                                    <div
                                        key={item._id}
                                        className={`rounded-xl p-5 bg-zinc-800/60 backdrop-blur-sm border shadow-lg shadow-black/20 transition flex flex-col justify-between ${
                                            overdue
                                                ? "border-rose-500/50 hover:border-rose-500"
                                                : "border-zinc-700/60 hover:border-zinc-600"
                                        }`}
                                    >
                                        <div>
                                            {/* Header with Title and Status Badge */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FaBook className="text-2xl text-amber-400 shrink-0" />
                                                    <h2
                                                        className="text-lg font-semibold text-zinc-50 truncate"
                                                        title={book.title || "Untitled Book"}
                                                    >
                                                        {book.title || "Untitled Book"}
                                                    </h2>
                                                </div>

                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <span
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                            isActive
                                                                ? overdue
                                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                                : "bg-zinc-700/30 text-zinc-400 border-zinc-700"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? overdue
                                                                ? `Overdue (${overdueDays}d)`
                                                                : "Active Loan"
                                                            : "Returned"}
                                                    </span>

                                                    {fineAmount > 0 && (
                                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                                            Fine: ₹{fineAmount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Book Details */}
                                            <p className="text-zinc-400 text-sm">
                                                <span className="text-zinc-500">Author:</span>{" "}
                                                {book.author || "Unknown"}
                                            </p>
                                            {book.genre && (
                                                <p className="text-zinc-400 text-sm mt-1">
                                                    <span className="text-zinc-500">Genre:</span>{" "}
                                                    {book.genre}
                                                </p>
                                            )}

                                            {/* Dates Section */}
                                            <div className="mt-4 p-3 bg-zinc-900/60 rounded-lg space-y-2 text-xs border border-zinc-800">
                                                <div className="flex items-center justify-between text-zinc-400">
                                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                                        <FaCalendarAlt className="text-zinc-400" />
                                                        Borrowed:
                                                    </span>
                                                    <span className="font-medium text-zinc-200">
                                                        {formatDate(item.borrowedAt)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between text-zinc-400">
                                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                                        <FaClock className="text-zinc-400" />
                                                        Due Date:
                                                    </span>
                                                    <span
                                                        className={`font-medium ${
                                                            overdue
                                                                ? "text-rose-400 font-semibold"
                                                                : "text-zinc-200"
                                                        }`}
                                                    >
                                                        {formatDate(item.dueDate)}
                                                    </span>
                                                </div>

                                                {item.returnedAt && (
                                                    <div className="flex items-center justify-between text-zinc-400">
                                                        <span className="flex items-center gap-1.5 text-zinc-500">
                                                            <FaCheckCircle className="text-emerald-400" />
                                                            Returned:
                                                        </span>
                                                        <span className="font-medium text-emerald-400">
                                                            {formatDate(item.returnedAt)}
                                                        </span>
                                                    </div>
                                                )}

                                                {fineAmount > 0 && (
                                                    <div className="flex items-center justify-between text-rose-400 pt-1 border-t border-zinc-800 font-medium">
                                                        <span>
                                                            {isActive ? "Calculated Fine (₹50/day):" : "Final Fine:"}
                                                        </span>
                                                        <span className="font-bold">
                                                            ₹{fineAmount}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Area */}
                                        <div className="mt-5 pt-4 border-t border-zinc-700/60 flex items-center justify-between">
                                            <span className="text-xs text-zinc-500">
                                                {isActive
                                                    ? "14-day borrowing loan"
                                                    : "Loan completed"}
                                            </span>

                                            {isActive ? (
                                                <button
                                                    onClick={() =>
                                                        handleReturn(
                                                            item._id,
                                                            book.title || "this book"
                                                        )
                                                    }
                                                    disabled={isReturning}
                                                    className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-900 bg-amber-500 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <FaUndo className="text-xs" />
                                                    {isReturning ? "Returning..." : "Return Book"}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                                    <FaCheckCircle className="text-emerald-500" />
                                                    Returned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </>
    );
};

export default MyBorrowings;
