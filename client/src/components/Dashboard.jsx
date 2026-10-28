import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard({ user }) {
  const [messages, setMessages] = useState([]);
  const [newText, setNewText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .listMessages()
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const addMessage = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setError("");
    setBusy(true);
    try {
      const created = await api.createMessage(newText);
      setMessages((prev) => [created, ...prev]);
      setNewText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.message);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id) => {
    if (!editText.trim()) return;
    setError("");
    setBusy(true);
    try {
      const updated = await api.updateMessage(id, editText);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      cancelEdit();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const removeMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    setError("");
    try {
      await api.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="card">
        <h2>Add a note</h2>
        <form onSubmit={addMessage} className="form row">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Write a short message…"
            maxLength={1000}
          />
          <button className="btn primary" disabled={busy || !newText.trim()}>
            Add
          </button>
        </form>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h2>My messages ({messages.length})</h2>

        {loading ? (
          <p>Loading…</p>
        ) : messages.length === 0 ? (
          <p className="muted">No messages yet. Add your first note above.</p>
        ) : (
          <ul className="message-list">
            {messages.map((msg) => (
              <li key={msg.id} className="message-item">
                {editingId === msg.id ? (
                  <div className="form row">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      maxLength={1000}
                      autoFocus
                    />
                    <button
                      className="btn primary"
                      onClick={() => saveEdit(msg.id)}
                      disabled={busy}
                    >
                      Save
                    </button>
                    <button
                      className="btn ghost"
                      onClick={cancelEdit}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="message-body">
                      <p>{msg.message}</p>
                      <small className="muted">
                        {new Date(msg.created_at).toLocaleString()}
                        {msg.updated_at !== msg.created_at && " · edited"}
                      </small>
                    </div>
                    <div className="actions">
                      <button
                        className="btn ghost"
                        onClick={() => startEdit(msg)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => removeMessage(msg.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
