import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
    FaBook,
    FaCheckCircle,
    FaUsers,
    FaClock,
    FaExclamationTriangle,
    FaSyncAlt,
    FaPlus,
    FaLayerGroup,
} from "react-icons/fa";
import { MdOutlineMenuBook } from "react-icons/md";
import { BiRupee } from "react-icons/bi";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            setError(null);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/dashboard/stats`,
                { withCredentials: true }
            );
            setStats(response.data);
        } catch (err) {
            console.error("Failed to load dashboard statistics:", err);
            setError(
                err.response?.data?.message ||
                "Failed to fetch real-time dashboard metrics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const metricCards = stats
        ? [
              {
                  title: "Total Books",
                  value: stats.totalBooks ?? 0,
                  subtitle: "Unique titles in catalog",
                  icon: <FaBook className="text-3xl text-amber-400" />,
                  accentBorder: "hover:border-amber-500/40",
                  badge: "Catalog",
                  badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
              },
              {
                  title: "Total Copies",
                  value: stats.totalCopies ?? 0,
                  subtitle: "Total physical inventory",
                  icon: <FaLayerGroup className="text-3xl text-sky-400" />,
                  accentBorder: "hover:border-sky-500/40",
                  badge: "Inventory",
                  badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
              },
              {
                  title: "Available Copies",
                  value: stats.availableCopies ?? 0,
                  subtitle: "Ready for checkout",
                  icon: <FaCheckCircle className="text-3xl text-emerald-400" />,
                  accentBorder: "hover:border-emerald-500/40",
                  badge: "In Stock",
                  badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
              },
              {
                  title: "Borrowed Copies",
                  value: stats.borrowedCopies ?? 0,
                  subtitle: "Currently in circulation",
                  icon: <MdOutlineMenuBook className="text-3xl text-indigo-400" />,
                  accentBorder: "hover:border-indigo-500/40",
                  badge: "Circulating",
                  badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
              },
              {
                  title: "Total Members",
                  value: stats.totalMembers ?? 0,
                  subtitle: "Registered library users",
                  icon: <FaUsers className="text-3xl text-purple-400" />,
                  accentBorder: "hover:border-purple-500/40",
                  badge: "Members",
                  badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
              },
              {
                  title: "Active Loans",
                  value: stats.activeLoans ?? 0,
                  subtitle: "Ongoing member borrowings",
                  icon: <FaClock className="text-3xl text-blue-400" />,
                  accentBorder: "hover:border-blue-500/40",
                  badge: "Active",
                  badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
              },
              {
                  title: "Overdue Loans",
                  value: stats.overdueLoans ?? 0,
                  subtitle: "Past scheduled return date",
                  icon: <FaExclamationTriangle className="text-3xl text-rose-400" />,
                  accentBorder: "hover:border-rose-500/40",
                  badge: stats.overdueLoans > 0 ? "Requires Attention" : "Clear",
                  badgeColor:
                      stats.overdueLoans > 0
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700",
              },
              {
                  title: "Total Fines",
                  value: `₹${stats.totalFines ?? 0}`,
                  subtitle: "Finalized + active accrued",
                  icon: <BiRupee className="text-4xl text-amber-300" />,
                  accentBorder: "hover:border-amber-400/40",
                  badge: "₹50 / day rate",
                  badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
              },
          ]
        : [];

    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)] text-zinc-100">
                <div className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">

                    {/* Dashboard Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-zinc-800">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-50 tracking-tight">
                                    Admin Dashboard
                                </h1>
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    Administrator
                                </span>
                            </div>
                            <p className="text-zinc-400 mt-2">
                                Real-time library inventory, member loans, and fine metrics.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing || loading}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 text-sm font-medium transition cursor-pointer disabled:opacity-50"
                                title="Refresh statistics"
                            >
                                <FaSyncAlt className={`text-xs ${refreshing ? "animate-spin text-amber-400" : ""}`} />
                                {refreshing ? "Refreshing..." : "Refresh Stats"}
                            </button>

                            <Link to="/add-book">
                                <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition cursor-pointer shadow-lg shadow-black/20">
                                    <FaPlus className="text-xs" />
                                    Add Book
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FaExclamationTriangle className="text-xl shrink-0" />
                                <span>{error}</span>
                            </div>
                            <button
                                onClick={fetchStats}
                                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Metrics Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-44 rounded-xl bg-zinc-800/40 border border-zinc-700/40 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {metricCards.map((card, idx) => (
                                <div
                                    key={idx}
                                    className={`bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 rounded-xl p-6 shadow-lg shadow-black/20 hover:shadow-xl hover:-translate-y-1 transition duration-300 flex flex-col justify-between ${card.accentBorder}`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                                                {card.icon}
                                            </div>
                                            <span
                                                className={`text-xs px-2.5 py-1 rounded-full border ${card.badgeColor}`}
                                            >
                                                {card.badge}
                                            </span>
                                        </div>

                                        <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                                            {card.title}
                                        </p>
                                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mt-1 tracking-tight">
                                            {card.value}
                                        </h2>
                                    </div>

                                    <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-700/40">
                                        {card.subtitle}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Info & Direct Links */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                Catalog Management
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                View complete book inventory, edit book quantities, update publisher details, or remove titles.
                            </p>
                            <Link
                                to="/books"
                                className="text-amber-400 hover:text-amber-300 text-sm font-semibold inline-flex items-center gap-1.5 transition"
                            >
                                Browse All Books →
                            </Link>
                        </div>

                        <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-zinc-200 mb-2">
                                Lending Policies & Fines
                            </h3>
                            <p className="text-sm text-zinc-400 mb-4">
                                Standard borrowing window is 14 days. Overdue loans accumulate ₹50 per day dynamically until recorded upon return.
                            </p>
                            <span className="text-zinc-500 text-xs">
                                System Status: Operational • Real-time DB Sync Active
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
        </>
    );
};

export default AdminDashboard;
