import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
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
          "http://localhost:3000/api/auth/me",
          {
            withCredentials: true,
          }
        );

        const booksResponse = await axios.get(
          "http://localhost:3000/api/books",
          {
            withCredentials: true,
          }
        );

        setUser(userResponse.data.user);
        setBooks(booksResponse.data.books);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  const totalBooks = books.length;

  const availableBooks = books.filter(
    (book) => book.status === "Available"
  ).length;

  const borrowedBooks = books.filter(
    (book) => book.status === "Borrowed"
  ).length;

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
            <FaUserCircle className="text-8xl text-blue-500 mb-3" />

            <h2 className="text-2xl font-semibold">
              {user.username}
            </h2>

            <p className="text-zinc-400">
              Library Member
            </p>
          </div>

          <form className="flex flex-col gap-5">

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaUser className="text-blue-500" />
                Username
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none"
                type="text"
                value={user.username || ""}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaEnvelope className="text-blue-500" />
                Email
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none"
                type="email"
                value={user.email || ""}
                readOnly
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-white">
                <FaCalendarAlt className="text-blue-500" />
                Date of Birth
              </label>

              <input
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none"
                type="date"
                value={user.dob ? user.dob.substring(0, 10) : ""}
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