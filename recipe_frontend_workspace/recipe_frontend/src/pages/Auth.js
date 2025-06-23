import React, { useState } from "react";
import { useAuth } from "../AuthContext";

export default function AuthPage() {
  const [loginMode, setLoginMode] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const { login, signup, loading, user, logout } = useAuth();

  const handleChange = evt => setForm(f => ({ ...f, [evt.target.name]: evt.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const fn = loginMode ? login : signup;
    const resp = await fn(form);
    if (!resp.success) setError(resp.error);
  }

  if (user)
    return (
      <div className="container" style={{ paddingTop: 120 }}>
        <h2>Welcome, {user.username}!</h2>
        <button className="btn" onClick={logout} style={{ marginTop: 24 }}>Log Out</button>
      </div>
    );

  return (
    <div className="container" style={{ paddingTop: 120, maxWidth: 420 }}>
      <h2>{loginMode ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input
          type="text"
          required
          name="username"
          placeholder="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          style={{
            fontSize: "1rem",
            padding: 10,
            borderRadius: 4,
            border: "1px solid var(--border-color)"
          }}
        />
        <input
          type="password"
          required
          name="password"
          placeholder="Password"
          autoComplete={loginMode ? "current-password" : "new-password"}
          value={form.password}
          onChange={handleChange}
          style={{
            fontSize: "1rem",
            padding: 10,
            borderRadius: 4,
            border: "1px solid var(--border-color)"
          }}
        />
        <button className="btn btn-large" type="submit" disabled={loading}>
          {loading ? "Please wait…" : loginMode ? "Login" : "Sign Up"}
        </button>
      </form>
      <div style={{ marginTop: 18 }}>
        {loginMode ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          style={{ background: "none", border: "none", color: "var(--base-light)", fontWeight: 500, cursor: "pointer" }}
          onClick={() => setLoginMode(m => !m)}
        >{loginMode ? "Sign Up" : "Login"}</button>
      </div>
      {error && <div style={{ color: "tomato", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
