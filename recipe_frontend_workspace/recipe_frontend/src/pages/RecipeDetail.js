import React, { useEffect, useState } from "react";
import { fetchRecipeDetail, saveFavorite, removeFavorite } from "../api";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RecipeDetail() {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [favLoading, setFavLoading] = useState(false);
  const { favorites, setFavorites, token } = useAuth();

  useEffect(() => {
    fetchRecipeDetail(recipeId)
      .then(setRecipe)
      .catch(() => setRecipe(null));
  }, [recipeId]);

  if (!recipe)
    return <div className="container" style={{ paddingTop: 120 }}>Recipe not found.</div>;

  const isFavorited = favorites.some(f => f.recipe_id === recipe.id);

  async function handleFavorite() {
    if (!token) return;
    setFavLoading(true);
    try {
      if (!isFavorited) {
        await saveFavorite(recipe.id, token);
        setFavorites(favs => ([...favs, { recipe_id: recipe.id }]));
      } else {
        await removeFavorite(recipe.id, token);
        setFavorites(favs => favs.filter(f => f.recipe_id !== recipe.id));
      }
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 600 }}>
      <h1>{recipe.title}{" "}
        <button
          className="btn"
          style={{
            fontSize: "1.2rem",
            background: isFavorited ? "gold" : "var(--base-light)",
            marginLeft: 16
          }}
          disabled={favLoading || !token}
          onClick={handleFavorite}
        >
          {isFavorited ? "★ Unfavorite" : "☆ Favorite"}
        </button>
      </h1>
      <div style={{ color: "var(--text-secondary)", marginBottom: 8 }}>
        {recipe.description}
      </div>
      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <h3>Preparation</h3>
      <ol>
        {recipe.steps?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ol>
    </div>
  );
}
