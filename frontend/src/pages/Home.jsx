import React, { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";

import Cards from "../components/dashboard/Cards";
import { FaBook, FaCheckCircle } from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";
import Welcome from "../components/dashboard/Welcome";
import Actions from "../components/dashboard/Actions";
import BookCard from "../components/books/BookCard";

const Home = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

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

    const fetchUser = async () => {
    try {
        const response = await axios.get(
            "http://localhost:3000/api/auth/me",
            {
                withCredentials: true,
            }
        );
        console.log(response.data);
        setUser(response.data.user);

    } catch (err) {
        console.log(err);
    }
};

    useEffect(() => {
        fetchBooks();
        fetchUser();
    }, []);

    const totalBooks = books.length;

    const availableBooks = books.filter(
        (book) => book.status === "Available"
    ).length;

    const borrowedBooks = books.filter(
        (book) => book.status === "Borrowed"
    ).length;

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)]">
                <div className="flex flex-col gap-10 p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">

            <Welcome username={user.username} />
                    {/* Stat cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <Cards
                            icon={<FaBook />}
                            count={totalBooks}
                            title="Total Books"
                        />
                        <Cards
                            icon={<FaCheckCircle />}
                            count={availableBooks}
                            title="Available"
                        />
                        <Cards
                            icon={<MdOutlineMenuBook />}
                            count={borrowedBooks}
                            title="Borrowed"
                        />
                    </div>

                    <Actions />

                    {/* Section header with accent rule */}
                    <div className="flex items-center gap-4 mt-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 whitespace-nowrap">
                            Recently Added Books
                        </h2>
                        <span className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                    </div>

                    {/* Book grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-48 rounded-xl bg-zinc-800/40 border border-zinc-700/40 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : books.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-zinc-700 p-10 text-center text-zinc-400">
                            No books yet — add one to see it here.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {books.slice(0, 3).map((book) => (
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

            <Footer />
        </>
    );
};

export default Home;