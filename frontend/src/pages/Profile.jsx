import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaShieldAlt,
  FaBook,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";

const Profile = () => {
  const [user, setUser] = useState({});
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/me`,
          {
            withCredentials: true,
          }
        );

        const booksResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/books`,
          {
            withCredentials: true,
          }
        );

        setUser(userResponse.data.user);
        setBooks(booksResponse.data.books || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const totalBooks = books.length;

  const availableBooks = books.filter(
    (book) => (book.availableQuantity ?? 1) > 0
  ).length;

  const borrowedBooks = books.filter(
    (book) => (book.availableQuantity ?? 0) === 0
  ).length;

  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-zinc-400 mt-2">
            View your account information.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-xl p-8 shadow-lg">

          <div className="flex flex-col items-center mb-8">
            <FaUserCircle className="text-8xl text-amber-500 mb-3" />

            <h2 className="text-2xl font-semibold">
              {user.username}
            </h2>

            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              isAdmin
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
            }`}>
              {isAdmin ? "Administrator" : "Library Member"}
            </span>
          </div>

          <form className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaUser className="text-amber-500" />
                Username
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none text-zinc-100"
                type="text"
                value={user.username || ""}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaEnvelope className="text-amber-500" />
                Email
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none text-zinc-100"
                type="email"
                value={user.email || ""}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaShieldAlt className="text-amber-500" />
                Role
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none text-zinc-100 capitalize"
                type="text"
                value={user.role || "member"}
                readOnly
              />
            </div>

          </form>

          <div className="grid grid-cols-3 gap-4 mt-8">

            <div className="bg-zinc-900 rounded-lg p-5 text-center">
              <FaBook className="text-3xl text-blue-500 mx-auto mb-3" />
              <h2 className="text-3xl font-bold">
                {totalBooks}
              </h2>
              <p className="text-zinc-400">
                Total Books
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-5 text-center">
              <FaCheckCircle className="text-3xl text-green-500 mx-auto mb-3" />
              <h2 className="text-3xl font-bold">
                {availableBooks}
              </h2>
              <p className="text-zinc-400">
                Available
              </p>
            </div>

            <div className="bg-zinc-900 rounded-lg p-5 text-center">
              <MdOutlineMenuBook className="text-3xl text-yellow-500 mx-auto mb-3" />
              <h2 className="text-3xl font-bold">
                {borrowedBooks}
              </h2>
              <p className="text-zinc-400">
                Borrowed
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;