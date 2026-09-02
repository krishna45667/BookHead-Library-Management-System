import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false, memberOnly = false }) => {
    const { user, loading, fetchUser } = useAuth();

    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, [user, fetchUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-zinc-900 text-white">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/books" replace />;
    }

    if (memberOnly && user.role === "admin") {
        return <Navigate to="/books" replace />;
    }

    return children;
};

export default ProtectedRoute;