import React, { useState, useEffect } from "react";
import { createRecipe, updateRecipe, fetchRecipeDetail } from "../api";
import { useAuth } from "../AuthContext";
import { useNavigate, useParams } from "react-router-dom";

export default function RecipeForm() {
  const { token } = useAuth();
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    ingredients: "",
    steps: ""
  });
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetail(recipeId)
        .then(recipe => {
          setForm({
            title: recipe.title,
            description: recipe.description,
            ingredients: recipe.ingredients?.join(", ") || "",
            steps: recipe.steps?.join("\\n") || ""
          });
          setEditing(true);
        })
        .catch(() => {});
    }
  }, [recipeId]);

  function handleChange(evt) {
    setForm(f => ({ ...f, [evt.target.name]: evt.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        ingredients: form.ingredients
          .split(",")
          .map(i => i.trim())
          .filter(Boolean),
        steps: form.steps
          .split(/\\n|\\r|\\r\\n/)
          .map(s => s.trim())
          .filter(Boolean)
      };
      if (editing) {
        await updateRecipe(recipeId, payload, token);
      } else {
        await createRecipe(payload, token);
      }
      navigate("/");
    } catch (err) {
      setError(err?.response?.data?.detail || "Save failed");
    }
  }

  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 640 }}>
      <h2>{editing ? "Edit Recipe" : "Create New Recipe"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          required
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          style={{ padding: 9, borderRadius: 4, border: "1px solid var(--border-color)", fontSize: "1rem" }}
        />
        <textarea
          required
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          style={{ padding: 9, borderRadius: 4, border: "1px solid var(--border-color)", fontSize: "1rem" }}
        />
        <textarea
          required
          name="ingredients"
          placeholder="Ingredients (separate by commas)"
          value={form.ingredients}
          onChange={handleChange}
          style={{ padding: 9, borderRadius: 4, border: "1px solid var(--border-color)", fontSize: "1rem" }}
        />
        <textarea
          required
          name="steps"
          placeholder="Preparation steps (one per line)"
          value={form.steps}
          onChange={handleChange}
          rows={7}
          style={{ padding: 9, borderRadius: 4, border: "1px solid var(--border-color)", fontSize: "1rem" }}
        />
        <button className="btn btn-large" type="submit">
          {editing ? "Update Recipe" : "Create Recipe"}
        </button>
        {error && <div style={{ color: "tomato", marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
