import React, { useState } from "react";
import { fetchRecipes } from "../api";
import { Link } from "react-router-dom";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    const data = await fetchRecipes(query);
    setResults(data.recipes || []);
    setLoading(false);
  }

  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 600 }}>
      <h2>Search Recipes</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 28 }}>
        <input
          type="text"
          placeholder="Search for ingredient, dish, etc."
          aria-label="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 4,
            border: "1px solid var(--border-color)",
            marginRight: 10,
            width: "70%",
            fontSize: "1rem"
          }}
        />
        <button type="submit" className="btn">Search</button>
      </form>
      {loading && <div>Searching…</div>}
      {results && (
        <div>
          <div style={{ marginBottom: 12 }}>{results.length} result(s):</div>
          {results.length === 0 && <div style={{ color: "var(--text-secondary)" }}>No recipes found.</div>}
          <div style={{ display: "grid", gap: 18 }}>
            {results.map(r => (
              <div key={r.id} style={{
                background: "rgba(255,255,255,0.05)",
                padding: 14,
                borderRadius: 5
              }}>
                <Link to={`/recipes/${r.id}`} style={{ color: "var(--base-light)", fontWeight: 600 }}>{r.title}</Link>
                <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)" }}>{r.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
