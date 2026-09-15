import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaArrowLeft, FaBookOpen } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const inputClass =
    "w-full px-4 py-3 rounded-lg bg-zinc-900/60 text-zinc-100 placeholder:text-zinc-500 border border-zinc-700/60 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition";

const labelClass = "text-sm font-medium text-zinc-400 mb-1.5 block";

const AddBook = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAdmin, loading } = useAuth();

    const book = location.state;

    useEffect(() => {
        if (!loading && !isAdmin) {
            navigate("/books");
        }
    }, [isAdmin, loading, navigate]);

    const [formData, setFormData] = useState({
        title: book?.title || "",
        author: book?.author || "",
        genre: book?.genre || "",
        publisher: book?.publisher || "",
        pageCount: book?.pageCount || "",
        quantity: book?.quantity !== undefined ? book.quantity : 1,
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.author ||
            !formData.genre ||
            !formData.publisher ||
            !formData.pageCount ||
            formData.quantity === ""
        ) {
            alert("Please fill all the fields.");
            return;
        }

        const payload = {
            ...formData,
            pageCount: Number(formData.pageCount),
            quantity: Number(formData.quantity),
        };

        if (payload.quantity < 0) {
            alert("Quantity must be a non-negative number.");
            return;
        }

        try {
            if (book) {
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/books/${book.id}`,
                    payload,
                    { withCredentials: true }
                );
                alert(response.data.message);
            } else {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/books`,
                    payload,
                    { withCredentials: true }
                );
                alert(response.data.message);
            }

            navigate("/books");
        } catch (err) {
            alert(err.response?.data?.message || "Operation Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-[500px]">

                <Link
                    to="/books"
                    className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-amber-400 transition mb-5"
                >
                    <FaArrowLeft className="text-xs" />
                    Back to Books
                </Link>

                <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 p-8 rounded-xl shadow-lg shadow-black/20">

                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg">
                            <FaBookOpen className="text-lg" />
                        </div>
                        <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">
                            {book ? "Edit Book" : "Add Book"}
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className={labelClass} htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                name="title"
                                placeholder="e.g. The Great Gatsby"
                                value={formData.title}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className={labelClass} htmlFor="author">Author</label>
                            <input
                                id="author"
                                type="text"
                                name="author"
                                placeholder="e.g. F. Scott Fitzgerald"
                                value={formData.author}
                                onChange={handleChange}
                                className={inputClass}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass} htmlFor="genre">Genre</label>
                                <input
                                    id="genre"
                                    type="text"
                                    name="genre"
                                    placeholder="Fiction"
                                    value={formData.genre}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="pageCount">Page Count</label>
                                <input
                                    id="pageCount"
                                    type="number"
                                    min="1"
                                    name="pageCount"
                                    placeholder="180"
                                    value={formData.pageCount}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass} htmlFor="publisher">Publisher</label>
                                <input
                                    id="publisher"
                                    type="text"
                                    name="publisher"
                                    placeholder="e.g. Scribner"
                                    value={formData.publisher}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="quantity">Total Copies</label>
                                <input
                                    id="quantity"
                                    type="number"
                                    min="0"
                                    name="quantity"
                                    placeholder="1"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="mt-2 bg-amber-500 hover:bg-amber-400 transition py-3 rounded-lg text-zinc-900 font-semibold cursor-pointer"
                        >
                            {book ? "Update Book" : "Add Book"}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default AddBook;