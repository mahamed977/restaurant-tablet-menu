"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminHeader } from "../../../components/AdminHeader";
import { useAdminToken } from "../../../hooks/useAdminToken";
import { Category } from "../../../types";

type FormState = {
  name: string;
  sort_order: number;
  is_active: boolean;
};

export default function CategoriesPage() {
  const token = useAdminToken();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>({ name: "", sort_order: 1, is_active: true });
  const [error, setError] = useState<string | null>(null);

  const headers = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : ""
    }),
    [token]
  );

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories", { headers });
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (token === null) return;
    load();
  }, [token, headers]);

  const createCategory = async () => {
    setError(null);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create");
      return;
    }
    setForm({ name: "", sort_order: 1, is_active: true });
    await load();
  };

  const updateCategory = async (id: string, patch: Partial<FormState>) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(patch)
    });
    await load();
  };

  const deleteCategory = async (id: string) => {
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE", headers });
    await load();
  };

  const move = async (id: string, direction: -1 | 1) => {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const reordered = [...categories];
    const target = idx + direction;
    if (target < 0 || target >= reordered.length) return;
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const order = reordered.map((c) => c.id);
    await fetch("/api/admin/categories/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ order })
    });
    await load();
  };

  if (token === null) return null;

  return (
    <div className="app-shell">
      <AdminHeader />
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div className="card">
          <div className="flex-between">
            <h2 style={{ margin: 0 }}>Categories</h2>
            {loading && <span className="pill">Loading…</span>}
          </div>
          <div className="spacer" />
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Active</th>
                <th style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => updateCategory(cat.id, { is_active: !cat.is_active })}
                    >
                      {cat.is_active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <div className="flex" style={{ gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => move(cat.id, -1)}>
                        ▲
                      </button>
                      <button className="btn btn-secondary" onClick={() => move(cat.id, 1)}>
                        ▼
                      </button>
                      <button className="btn btn-secondary" onClick={() => deleteCategory(cat.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Add Category</h3>
          <div className="grid" style={{ gap: 12 }}>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label>Sort order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex" style={{ gap: 10 }}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                style={{ width: 18 }}
              />
              <span>Active</span>
            </div>
            {error && <div className="badge badge-danger">{error}</div>}
            <button className="btn" onClick={createCategory} disabled={!form.name}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
