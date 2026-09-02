import React from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaBook } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Actions = () => {
  const { isAdmin } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-zinc-50 mb-5">
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-4">
        {isAdmin && (
          <Link
            to="/add-book"
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 transition px-6 py-3.5 rounded-xl text-zinc-900 font-semibold shadow-lg shadow-black/20"
          >
            <FaPlus />
            Add Book
          </Link>
        )}

        <Link
          to="/books"
          className="flex items-center gap-3 bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/60 transition px-6 py-3.5 rounded-xl text-zinc-200 font-medium"
        >
          <FaBook />
          View Books
        </Link>
      </div>
    </div>
  );
};

export default Actions;
