import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import SearchBar from "../components/books/SearchBar";
import BookCard from "../components/books/BookCard";

const Books = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://localhost:3000/api/books",
                { withCredentials: true }
            );
            setBooks(response.data.books);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        book.genre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)]">
            <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                            Library Books
                        </h1>
                        <p className="text-zinc-400 mt-2">
                            Browse, search and manage your books.
                        </p>
                    </div>

                    <Link to="/add-book">
                        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 px-5 py-3 rounded-lg text-zinc-900 font-semibold transition">
                            <FaPlus className="text-sm" />
                            Add Book
                        </button>
                    </Link>
                </div>

                <SearchBar search={search} setSearch={setSearch} />

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-48 rounded-xl bg-zinc-800/40 border border-zinc-700/40 animate-pulse"
                            />
                        ))}
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-zinc-400 mt-6">
                        {search
                            ? `No books match "${search}".`
                            : "No books yet — add one to get started."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book._id}
                                id={book._id}
                                title={book.title}
                                author={book.author}
                                genre={book.genre}
                                publisher={book.publisher}
                                pageCount={book.pageCount}
                                status={book.status}
                                fetchBooks={fetchBooks}
                            />
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Books;