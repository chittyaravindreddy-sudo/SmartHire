import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/profile")
      .then((res) => {
        setForm({
          name: res.data.user.name,
          email: res.data.user.email,
          password: "",
        });
      })
      .catch(() => setMessage("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload: {
        name: string;
        email: string;
        password?: string;
      } = {
        name: form.name,
        email: form.email,
      };

      if (form.password) {
        payload.password = form.password;
      }

      const { data } = await api.put("/profile", payload);

      localStorage.setItem("user", JSON.stringify(data.user));

      setForm({
        ...form,
        password: "",
      });

      setMessage("Profile updated successfully");
    } catch (err: any) {
      setMessage(
        err.response?.data?.message || "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Recruiter Profile</h1>
      <p>Manage your recruiter account.</p>

      <form className="form-card profile-form" onSubmit={submit}>
        {message && <div className="success">{message}</div>}

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          required
        />

        <input
          type="password"
          placeholder="New password (optional)"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Update Profile"}
        </button>
      </form>
    </main>
  );
}
