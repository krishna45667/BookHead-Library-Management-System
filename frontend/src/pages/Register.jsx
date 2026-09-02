import React, { useState } from 'react'
import { FaBookOpen } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const inputClass =
    "w-full px-4 py-3 bg-zinc-900/60 border border-zinc-700/60 outline-none rounded-lg focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition text-zinc-100";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            formData.username === "" ||
            formData.email === "" ||
            formData.password === ""
        ) {
            alert("Please fill all the fields.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/api/auth/register", formData
            );
            alert(response.data.message);
            navigate("/login");
        } catch (err) {
            console.log(err);
            alert(err.response?.data?.message || "Registration Failed");
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1115] bg-[radial-gradient(ellipse_at_top,_#1a1d24_0%,_#0f1115_55%)] flex flex-col lg:flex-row">

            <div className="lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-20 py-16 text-white">
                <div className="flex items-center gap-3 mb-6">
                    <FaBookOpen className="text-5xl lg:text-6xl text-amber-400" />
                    <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">BookHead</h1>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-zinc-50">
                    Your Personal Digital Library
                </h2>
                <p className="text-zinc-400 mt-5 text-lg leading-8 max-w-md">
                    Organize, manage and explore your book collection with a
                    modern library management system built for students,
                    readers and book lovers.
                </p>
                <div className="mt-10 space-y-4 text-lg text-zinc-300">
                    <p>📚 Add and manage books effortlessly</p>
                    <p>🔍 Search books instantly</p>
                    <p>✏️ Edit or delete books anytime</p>
                    <p>🔐 Secure authentication with JWT</p>
                    <p>⚡ Fast, modern and responsive UI</p>
                </div>
            </div>

            <div className="lg:w-1/2 flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-[450px]">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3">
                            <FaBookOpen className="text-4xl text-amber-400" />
                            <h1 className="text-3xl font-bold text-zinc-50">
                                Register Now
                            </h1>
                        </div>
                        <p className="text-zinc-400 mt-2">
                            Manage your library digitally
                        </p>
                    </div>

                    <div className="bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 rounded-xl p-8 shadow-lg shadow-black/20">
                        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-300">Username</label>
                                <input
                                    className={inputClass}
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-300">Email</label>
                                <input
                                    className={inputClass}
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-zinc-300">Password</label>
                                <input
                                    className={inputClass}
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <input
                                className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 transition font-semibold cursor-pointer text-zinc-900 text-lg hover:scale-[1.02] active:scale-95 mt-2"
                                type="submit"
                                value="Create Account"
                            />
                        </form>
                    </div>

                    <div className="mt-5 bg-zinc-800/60 backdrop-blur-sm border border-zinc-700/60 rounded-xl p-5 shadow-lg shadow-black/20 text-center">
                        <p className="text-zinc-400">Already have an account?</p>
                        <Link
                            to="/login"
                            className="text-amber-400 hover:text-amber-300 font-semibold transition"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Register