import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import RecipeDetail from "./pages/RecipeDetail";
import Search from "./pages/Search";
import AuthPage from "./pages/Auth";
import RecipeForm from "./pages/RecipeForm";
import Favorites from "./pages/Favorites";
import { AuthProvider, useAuth } from "./AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Link to="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
            <span className="logo-symbol">*</span> Recipe Vault
          </Link>
          <div style={{ display: "flex", gap: 14 }}>
            <Link to="/" className="btn">Home</Link>
            <Link to="/search" className="btn">Search</Link>
            {user && <Link to="/favorites" className="btn">Favorites</Link>}
            {user && <Link to="/create" className="btn">+ Recipe</Link>}
            <Link to="/auth" className="btn">{user ? "Profile" : "Sign In"}</Link>
            {user && (
              <button className="btn" style={{ background: "#333" }} onClick={() => { logout(); navigate("/auth"); }}>
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/create" element={user ? <RecipeForm /> : <Navigate to="/auth" />} />
      <Route path="/edit/:recipeId" element={user ? <RecipeForm /> : <Navigate to="/auth" />} />
      <Route path="/favorites" element={user ? <Favorites /> : <Navigate to="/auth" />} />
      <Route path="*" element={<div className="container" style={{ paddingTop: 120 }}>Page not found.</div>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <AppRoutes />
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;