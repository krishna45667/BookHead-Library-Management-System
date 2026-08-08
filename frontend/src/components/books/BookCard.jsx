import React from "react";
import axios from "axios";
import { FaBookOpen, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const BookCard = ({
    id,
    title,
    author,
    genre,
    publisher,
    pageCount,
    status,
    fetchBooks,
}) => {
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/books/${id}`, {
                withCredentials: true,
            });
            alert("Book Deleted Successfully");
            fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || "Delete Failed");
        }
    };

    const handleBorrow = async () => {
        try {
            const response = await axios.patch(
                `http://localhost:3000/api/books/${id}/status`,
                {},
                { withCredentials: true }
            );
            alert(response.data.message);
            fetchBooks();
        } catch (err) {
            alert(err.response?.data?.message || "Operation Failed");
        }
    };

    const handleEdit = () => {
        navigate("/add-book", {
            state: { id, title, author, genre, publisher, pageCount, status },
        });
    };

    const isAvailable = status === "Available";

    return (
        <div className="rounded-xl p-5 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-1 hover:border-amber-500/40 transition duration-300 flex flex-col">

            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <FaBookOpen className="text-2xl text-amber-400 shrink-0" />
                    <h2 className="text-lg font-semibold text-zinc-50 truncate">
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
                    {status}
                </span>
            </div>

            <p className="text-zinc-400 text-sm">
                <span className="text-zinc-500">Author:</span> {author}
            </p>
            <p className="text-zinc-400 text-sm mt-1">
                <span className="text-zinc-500">Genre:</span> {genre}
            </p>

            <div className="flex gap-2 mt-5 pt-4 border-t border-zinc-700/60">
                <button
                    onClick={handleBorrow}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-900 bg-amber-500 hover:bg-amber-400 transition"
                >
                    <FaBookOpen />
                    {isAvailable ? "Borrow" : "Return"}
                </button>

                <button
                    onClick={handleEdit}
                    aria-label="Edit book"
                    className="flex items-center justify-center px-3 py-2 rounded-lg text-zinc-300 bg-zinc-700/60 hover:bg-zinc-700 transition"
                >
                    <FaEdit />
                </button>

                <button
                    onClick={handleDelete}
                    aria-label="Delete book"
                    className="flex items-center justify-center px-3 py-2 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition"
                >
                    <FaTrash />
                </button>
            </div>
        </div>
    );
};

export default BookCard;