import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    FaBookOpen,
    FaCalendarAlt,
    FaClock,
    FaCheckCircle,
    FaUndo,
    FaSearch,
    FaSyncAlt,
    FaExclamationTriangle,
    FaUser,
} from "react-icons/fa";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

const AdminBorrowings = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // 'all' | 'active' | 'overdue' | 'returned'
    const [refreshing, setRefreshing] = useState(false);

    const fetchBorrowings = async () => {
        try {
            setError(null);
            const response = await axios.get(
                "http://localhost:3000/api/admin/borrowings",
                { withCredentials: true }
            );
            setBorrowings(response.data.borrowings || []);
        } catch (err) {
            console.error("Failed to fetch admin borrowings:", err);
            setError(
                err.response?.data?.message ||
                "Failed to fetch library borrowing records."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBorrowings();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBorrowings();
    };

    const handleReturn = async (borrowingId, bookTitle, memberName) => {
        if (
            !window.confirm(
                `Are you sure you want to mark "${bookTitle}" as returned for member ${memberName}?`
            )
        ) {
            return;
        }

        try {
            setReturningId(borrowingId);
            const response = await axios.patch(
                `http://localhost:3000/api/admin/borrowings/${borrowingId}/return`,
                {},
                { withCredentials: true }
            );

            alert(response.data.message || "Book returned successfully!");

            // Update in place
            setBorrowings((prev) =>
                prev.map((item) =>
                    item._id === borrowingId
                        ? {
                              ...item,
                              status: "Returned",
                              returnedAt:
                                  response.data.borrowing?.returnedAt ||
                                  new Date().toISOString(),
                              fine: response.data.borrowing?.fine || item.currentFine || 0,
                              currentFine:
                                  response.data.borrowing?.fine || item.currentFine || 0,
                              isOverdue: false,
                              overdueDays: 0,
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const activeLoans = borrowings.filter((b) => b.status === "Active");
    const overdueLoans = borrowings.filter((b) => b.status === "Active" && b.isOverdue);
    const returnedLoans = borrowings.filter((b) => b.status === "Returned");
    const totalFines = borrowings.reduce(
        (sum, b) => sum + (b.currentFine !== undefined ? b.currentFine : (b.fine || 0)),
        0
    );

    const filteredBorrowings = borrowings.filter((item) => {
        // Tab filter
        if (filter === "active" && item.status !== "Active") return false;
        if (filter === "overdue" && (!item.isOverdue || item.status !== "Active")) return false;
        if (filter === "returned" && item.status !== "Returned") return false;

        // Search query
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        const memberName = item.user?.username?.toLowerCase() || "";
        const memberEmail = item.user?.email?.toLowerCase() || "";
        const bookTitle = item.book?.title?.toLowerCase() || "";
        const bookAuthor = item.book?.author?.toLowerCase() || "";

        return (
            memberName.includes(q) ||
            memberEmail.includes(q) ||
            bookTitle.includes(q) ||
            bookAuthor.includes(q)
        );
    });

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)] text-zinc-100">
                <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                                    Borrowing Management
                                </h1>
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Admin Control
                                </span>
                            </div>
                            <p className="text-zinc-400 mt-2">
                                Oversee all member loans, overdue statuses, fine records, and process returns.
                            </p>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing || loading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 text-sm font-medium transition cursor-pointer disabled:opacity-50"
                            >
                                <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin text-amber-400" : ""}`} />
                                {refreshing ? "Refreshing..." : "Refresh Records"}
                            </button>

                            <Link to="/admin/dashboard">
                                <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium px-4 py-2.5 rounded-xl text-sm transition border border-zinc-700 cursor-pointer">
                                    Dashboard
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Summary Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                            <span className="text-xs text-zinc-400 block">Total Loans</span>
                            <span className="text-xl font-bold text-zinc-100">{borrowings.length}</span>
                        </div>
                        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                            <span className="text-xs text-zinc-400 block">Active Loans</span>
                            <span className="text-xl font-bold text-blue-400">{activeLoans.length}</span>
                        </div>
                        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                            <span className="text-xs text-zinc-400 block">Overdue Loans</span>
                            <span className="text-xl font-bold text-rose-400">{overdueLoans.length}</span>
                        </div>
                        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                            <span className="text-xs text-zinc-400 block">Returned</span>
                            <span className="text-xl font-bold text-emerald-400">{returnedLoans.length}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-3 text-center">
                            <span className="text-xs text-zinc-400 block">Total Fines</span>
                            <span className="text-xl font-bold text-amber-300">₹{totalFines}</span>
                        </div>
                    </div>

                    {/* Filter Tabs & Search Bar */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        {/* Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            {[
                                { key: "all", label: `All (${borrowings.length})` },
                                { key: "active", label: `Active (${activeLoans.length})` },
                                { key: "overdue", label: `Overdue (${overdueLoans.length})` },
                                { key: "returned", label: `Returned (${returnedLoans.length})` },
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer whitespace-nowrap ${
                                        filter === key
                                            ? "bg-amber-500 text-zinc-900 font-semibold shadow-md shadow-amber-500/10"
                                            : "text-zinc-400 hover:text-zinc-100 bg-zinc-800/40 hover:bg-zinc-800/80 border border-zinc-700/40"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full md:w-80">
                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />
                            <input
                                type="text"
                                placeholder="Search member or book..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-700/60 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition"
                            />
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaExclamationTriangle className="text-xl shrink-0" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchBorrowings}
                                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Borrowings Table */}
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-16 rounded-xl bg-zinc-800/40 border border-zinc-700/40 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : filteredBorrowings.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-700/80 bg-zinc-900/30 p-12 text-center text-zinc-400 mt-4">
                            <FaBookOpen className="text-5xl text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-200 mb-1">
                                No borrowing records found
                            </h3>
                            <p className="text-sm text-zinc-500">
                                {search
                                    ? `No results matching "${search}" in this category.`
                                    : "There are currently no borrowing records matching the selected filter."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-zinc-700/60 bg-zinc-800/60 backdrop-blur-sm shadow-lg shadow-black/20">
                            <table className="w-full text-left text-sm text-zinc-300">
                                <thead className="bg-zinc-900/80 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-700/60">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5">
                                            Member
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Book Details
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Borrowed Date
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Due Date
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Status
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Overdue Days
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Fine
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            Returned Date
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-700/40">
                                    {filteredBorrowings.map((item) => {
                                        const member = item.user || {};
                                        const book = item.book || {};
                                        const isActive = item.status === "Active";
                                        const isOverdue = isActive && item.isOverdue;
                                        const overdueDays = item.overdueDays || 0;
                                        const fineAmount =
                                            item.currentFine !== undefined
                                                ? item.currentFine
                                                : item.fine || 0;
                                        const isProcessing = returningId === item._id;

                                        return (
                                            <tr
                                                key={item._id}
                                                className={`hover:bg-zinc-700/20 transition ${
                                                    isOverdue ? "bg-rose-950/10" : ""
                                                }`}
                                            >
                                                {/* Member */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-700/60 flex items-center justify-center text-amber-400 shrink-0">
                                                            <FaUser className="text-xs" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-zinc-100 truncate">
                                                                {member.username || "Unknown"}
                                                            </div>
                                                            <div className="text-xs text-zinc-500 truncate">
                                                                {member.email || "-"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Book */}
                                                <td className="px-5 py-4">
                                                    <div className="min-w-0 max-w-xs">
                                                        <div
                                                            className="font-medium text-zinc-100 truncate"
                                                            title={book.title || "Untitled"}
                                                        >
                                                            {book.title || "Untitled"}
                                                        </div>
                                                        <div className="text-xs text-zinc-500 truncate">
                                                            by {book.author || "Unknown"}
                                                            {book.genre ? ` • ${book.genre}` : ""}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Borrowed Date */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs text-zinc-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-zinc-500" />
                                                        {formatDate(item.borrowedAt)}
                                                    </span>
                                                </td>

                                                {/* Due Date */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs">
                                                    <span
                                                        className={`flex items-center gap-1.5 font-medium ${
                                                            isOverdue
                                                                ? "text-rose-400 font-semibold"
                                                                : "text-zinc-300"
                                                        }`}
                                                    >
                                                        <FaClock className="text-zinc-500" />
                                                        {formatDate(item.dueDate)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                                            isActive
                                                                ? isOverdue
                                                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                                    : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? isOverdue
                                                                ? "Overdue"
                                                                : "Active"
                                                            : "Returned"}
                                                    </span>
                                                </td>

                                                {/* Overdue Days */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs text-center font-medium">
                                                    {isOverdue ? (
                                                        <span className="text-rose-400 font-bold">
                                                            {overdueDays} days
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-500">0</span>
                                                    )}
                                                </td>

                                                {/* Fine */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold">
                                                    {fineAmount > 0 ? (
                                                        <span className="text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                                                            ₹{fineAmount}
                                                        </span>
                                                    ) : (
                                                        <span className="text-zinc-400">₹0</span>
                                                    )}
                                                </td>

                                                {/* Returned Date */}
                                                <td className="px-5 py-4 whitespace-nowrap text-xs text-zinc-400">
                                                    {formatDate(item.returnedAt)}
                                                </td>

                                                {/* Action */}
                                                <td className="px-5 py-4 whitespace-nowrap text-right">
                                                    {isActive ? (
                                                        <button
                                                            onClick={() =>
                                                                handleReturn(
                                                                    item._id,
                                                                    book.title || "this book",
                                                                    member.username || "Member"
                                                                )
                                                            }
                                                            disabled={isProcessing}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-900 bg-amber-500 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-black/20"
                                                        >
                                                            <FaUndo className="text-xs" />
                                                            {isProcessing
                                                                ? "Processing..."
                                                                : "Return Book"}
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                                                            <FaCheckCircle />
                                                            Returned
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>

            <Footer />
        </>
    );
};

export default AdminBorrowings;
