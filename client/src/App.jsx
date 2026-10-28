import { useEffect, useState } from "react";
import { api } from "./api";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // Restore session from localStorage token on first load
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setChecking(false));
  }, []);

  const handleAuth = ({ token, user }) => {
    localStorage.setItem("token", token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (checking) {
    return (
      <div className="container">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header className={`topbar ${!user ? "center-header" : ""}`}>
        <h1>User Notes Dashboard</h1>
        {user && (
          <div className="userbox">
            <span>
              Signed in as <strong>{user.name}</strong>
            </span>
            <button className="btn ghost" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </header>

      {user ? <Dashboard user={user} /> : <AuthForm onAuth={handleAuth} />}
    </div>
  );
}
