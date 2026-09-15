import React, { useState } from "react";
import axios from "axios";
import { FaBookOpen, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const BookCard = ({
    id,
    title,
    author,
    genre,
    publisher,
    pageCount,
    quantity = 1,
    availableQuantity = 1,
    fetchBooks,
    isBorrowed = false,
}) => {
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [borrowing, setBorrowing] = useState(false);

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
            return;
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/books/${id}`, {
                withCredentials: true,
            });
            alert("Book Deleted Successfully");
            fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || "Delete Failed");
        }
    };

    const handleEdit = () => {
        navigate("/add-book", {
            state: { id, title, author, genre, publisher, pageCount, quantity },
        });
    };

    const handleBorrow = async () => {
        try {
            setBorrowing(true);
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/borrowings/${id}`,
                {},
                { withCredentials: true }
            );
            alert(response.data.message || "Book borrowed successfully!");
            if (fetchBooks) {
                fetchBooks();
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to borrow book");
        } finally {
            setBorrowing(false);
        }
    };

    const isAvailable = availableQuantity > 0;

    return (
        <div className="rounded-xl p-5 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/40 transition duration-300 flex flex-col justify-between">

            <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <FaBookOpen className="text-2xl text-amber-400 shrink-0" />
                        <h2 className="text-lg font-semibold text-zinc-50 truncate" title={title}>
                            {title}
                        </h2>
                    </div>

                    <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                            isAvailable
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        }`}
                    >
                        {isAvailable ? "Available" : "Unavailable"}
                    </span>
                </div>

                <p className="text-zinc-400 text-sm">
                    <span className="text-zinc-500">Author:</span> {author}
                </p>
                <p className="text-zinc-400 text-sm mt-1">
                    <span className="text-zinc-500">Genre:</span> {genre}
                </p>
                {publisher && (
                    <p className="text-zinc-400 text-sm mt-1">
                        <span className="text-zinc-500">Publisher:</span> {publisher}
                    </p>
                )}
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-700/60 flex items-center justify-between">
                <div className="text-xs text-zinc-400 space-y-0.5">
                    <div>
                        <span className="text-zinc-500">Total Copies:</span>{" "}
                        <span className="font-semibold text-zinc-200">{quantity}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Available:</span>{" "}
                        <span className={`font-semibold ${isAvailable ? "text-emerald-400" : "text-rose-400"}`}>
                            {availableQuantity}
                        </span>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            aria-label="Edit book"
                            className="flex items-center justify-center p-2.5 rounded-lg text-zinc-300 bg-zinc-700/60 hover:bg-zinc-700 hover:text-amber-400 transition cursor-pointer"
                        >
                            <FaEdit />
                        </button>

                        <button
                            onClick={handleDelete}
                            aria-label="Delete book"
                            className="flex items-center justify-center p-2.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition cursor-pointer"
                        >
                            <FaTrash />
                        </button>
                    </div>
                ) : (
                    <div>
                        {isBorrowed ? (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                Borrowed
                            </span>
                        ) : isAvailable ? (
                            <button
                                onClick={handleBorrow}
                                disabled={borrowing}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-900 bg-amber-500 hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                                {borrowing ? "Borrowing..." : "Borrow"}
                            </button>
                        ) : (
                            <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                                Unavailable
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookCard;