import React from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ search, setSearch }) => {
    return (
        <div className="flex items-center mb-2">

            <div className="relative w-full sm:w-96">

                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm" />

                <input
                    type="text"
                    placeholder="Search books..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-800/60 backdrop-blur-sm text-zinc-100 placeholder:text-zinc-500 outline-none border border-zinc-700/60 focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition"
                />

            </div>

        </div>
    );
};

export default SearchBar;