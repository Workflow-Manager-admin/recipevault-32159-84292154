import axios from "axios";

/*
  Base URL for backend (update if using a different deployment path)
  NOTE: To avoid CORS/network issues during local/dev deployments, consider:
  - Setting API_BASE to relative path ("/api") if using a proxy.
  - Aligning this with the backend host/port, e.g., http://localhost:3001.
  - Environment-variable based configuration (e.g., REACT_APP_API_BASE).
  - For deployments using different domains/ports, ensure correct value.
*/
const API_BASE = process.env.REACT_APP_API_BASE || "https://vscode-internal-79589-qa.qa01.cloud.kavia.ai:3001";
// PUBLIC_INTERFACE
export async function fetchRecipes(query = "") {
  // Search or fetch recipe list
  const url = query ? `${API_BASE}/recipes/search?query=${encodeURIComponent(query)}` : `${API_BASE}/recipes/`;
  const res = await axios.get(url);
  return res.data;
}

// PUBLIC_INTERFACE
export async function fetchRecipeDetail(recipeId) {
  // Fetch single recipe details
  const res = await axios.get(`${API_BASE}/recipes/${recipeId}`);
  return res.data;
}

// PUBLIC_INTERFACE
export async function signupUser(data) {
  // Register new user (expects {username, password})
  const res = await axios.post(`${API_BASE}/auth/signup`, data);
  return res.data;
}

// PUBLIC_INTERFACE
export async function loginUser(data) {
  // Login user (expects {username, password})
  const res = await axios.post(`${API_BASE}/auth/login`, data, { withCredentials: true });
  return res.data;
}

// PUBLIC_INTERFACE
export async function logoutUser() {
  // Logout current user
  const res = await axios.post(`${API_BASE}/auth/logout`, {}, { withCredentials: true });
  return res.data;
}

// PUBLIC_INTERFACE
export async function createRecipe(recipe, token) {
  const res = await axios.post(`${API_BASE}/recipes/`, recipe, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function updateRecipe(recipeId, recipe, token) {
  const res = await axios.put(`${API_BASE}/recipes/${recipeId}`, recipe, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function deleteRecipe(recipeId, token) {
  const res = await axios.delete(`${API_BASE}/recipes/${recipeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function getFavorites(token) {
  const res = await axios.get(`${API_BASE}/favorites`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function saveFavorite(recipeId, token) {
  const res = await axios.post(`${API_BASE}/favorites`, { recipe_id: recipeId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

// PUBLIC_INTERFACE
export async function removeFavorite(recipeId, token) {
  const res = await axios.delete(`${API_BASE}/favorites/${recipeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
