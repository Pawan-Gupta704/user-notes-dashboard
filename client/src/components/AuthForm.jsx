import { useState } from "react";
import { api } from "../api";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setForm({ ...form, password: "", newPassword: "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);

    try {
      if (mode === "signup") {
        await api.signup({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        setSuccessMsg("Account created successfully! Please log in.");
        setMode("login");
        setForm({ ...form, password: "", name: "" });
      } else if (mode === "login") {
        const data = await api.login({
          email: form.email,
          password: form.password,
        });
        onAuth(data);
      } else if (mode === "forgot") {
        const data = await api.resetPassword({
          email: form.email,
          newPassword: form.newPassword,
        });
        setSuccessMsg(data.message);
        setMode("login");
        setForm({ ...form, password: "", newPassword: "" });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card auth-card">
      {mode !== "forgot" && (
        <div className="tabs">
          <button
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            className={mode === "signup" ? "tab active" : "tab"}
            onClick={() => switchMode("signup")}
          >
            Sign Up
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="tabs">
          <button className="tab active" style={{ cursor: "default" }}>
            Reset Password
          </button>
        </div>
      )}

      <form onSubmit={submit} className="form">
        {mode === "signup" && (
          <label>
            Name
            <input name="name" value={form.name} onChange={change} required />
          </label>
        )}

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            required
            disabled={mode === "forgot" && busy}
          />
        </label>

        {mode === "login" && (
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              minLength={6}
              required
            />
          </label>
        )}

        {mode === "signup" && (
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={change}
              minLength={6}
              required
            />
          </label>
        )}

        {mode === "forgot" && (
          <label>
            New Password
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={change}
              minLength={6}
              required
            />
          </label>
        )}

        {error && <p className="error">{error}</p>}
        {successMsg && <p className="success">{successMsg}</p>}

        <button className="btn primary" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
                ? "Reset Password"
                : "Login"}
        </button>
      </form>

      {mode === "login" && (
        <div className="auth-links">
          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode("forgot")}
          >
            Forgot Password?
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="auth-links">
          <button
            type="button"
            className="link-btn"
            onClick={() => switchMode("login")}
          >
            ← Back to Login
          </button>
        </div>
      )}
    </div>
  );
}
