import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, isAdmin } = useAuth();

    const navLinks = [
        { to: "/home", label: "Home" },
        { to: "/books", label: "Books" },
        ...(!isAdmin ? [{ to: "/my-borrowings", label: "My Borrowings" }] : []),
        { to: "/profile", label: "Profile" },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            alert("Logged out Successfully");
            navigate("/login");
        } catch (err) {
            alert("Logout Failed");
        }
    };

    return (
        <nav className="sticky top-0 z-10 w-full bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 text-zinc-200 px-6 sm:px-8 py-4 flex items-center justify-between">

            <div className="flex items-center gap-3">
                <FaBookOpen className="text-3xl text-amber-400" />
                <h1 className="text-xl font-bold text-zinc-50 tracking-tight">
                    BookHead
                </h1>
            </div>

            <div className="flex items-center gap-8 font-medium text-sm">

                {navLinks.map(({ to, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`relative pb-1 transition duration-200 ${
                                isActive
                                    ? "text-amber-400"
                                    : "text-zinc-300 hover:text-amber-400"
                            }`}
                        >
                            {label}
                            <span
                                className={`absolute left-0 -bottom-0.5 h-px bg-amber-400 transition-all duration-200 ${
                                    isActive ? "w-full" : "w-0"
                                }`}
                            />
                        </Link>
                    );
                })}

                <button
                    onClick={handleLogout}
                    className="text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 px-4 py-2 rounded-lg transition duration-200"
                >
                    Logout
                </button>

            </div>
        </nav>
    );
};

export default Navbar;