import { Routes, Route } from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Books from "./pages/Books";
import Profile from "./pages/Profile";
import AddBook from "./pages/AddBook";
import MyBorrowings from "./pages/MyBorrowings";
import ProtectedRoute from "./components/ProtectedRoutes";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/books"
        element={
          <ProtectedRoute>
            <Books />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-borrowings"
        element={
          <ProtectedRoute memberOnly={true}>
            <MyBorrowings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-book"
        element={
          <ProtectedRoute adminOnly={true}>
            <AddBook />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;