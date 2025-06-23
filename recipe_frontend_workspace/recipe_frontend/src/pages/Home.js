import React, { useEffect, useState } from "react";
import { fetchRecipes } from "../api";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites } = useAuth();

  useEffect(() => {
    setLoading(true);
    fetchRecipes()
      .then(data => setRecipes(data.recipes || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: "80px" }}>Loading recipes...</div>;

  return (
    <div className="container" style={{ paddingTop: 120 }}>
      <h2>All Recipes</h2>
      <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              padding: 20,
              border: "1px solid var(--border-color)",
              position: "relative"
            }}
          >
            <Link to={`/recipes/${recipe.id}`}>
              <h3 style={{ margin: "0 0 10px 0", color: "var(--base-light)" }}>{recipe.title}</h3>
            </Link>
            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>
              {recipe.description}
            </div>
            {favorites.some(f => f.recipe_id === recipe.id) && (
              <span style={{
                position: "absolute", right: 18, top: 18, color: "gold"
              }} title="Favorited">★</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
