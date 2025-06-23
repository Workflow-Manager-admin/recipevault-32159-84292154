import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function Favorites() {
  const { favorites } = useAuth();

  return (
    <div className="container" style={{ paddingTop: 120 }}>
      <h2>Your Favorite Recipes</h2>
      {(!favorites || favorites.length === 0) && (
        <div style={{ color: "var(--text-secondary)" }}>You have no favorite recipes yet.</div>
      )}
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {favorites?.map(fav => (
          <Link to={`/recipes/${fav.recipe_id}`} key={fav.recipe_id} style={{ textDecoration: "none" }}>
            <div style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 8,
              padding: "10px 14px",
              color: "var(--base-light)",
              fontWeight: 500
            }}>
              Recipe #{fav.recipe_id}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
