"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminHeader } from "../../../components/AdminHeader";
import { useAdminToken } from "../../../hooks/useAdminToken";
import { Category, MenuItem } from "../../../types";

type ItemForm = {
  category_id: string;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  sort_order: number;
};

export default function ItemsPage() {
  const token = useAdminToken();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ItemForm>({
    category_id: "",
    name: "",
    description: "",
    price: 0,
    is_available: true,
    sort_order: 1
  });

  const headers = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json"
    }),
    [token]
  );

  const loadCategories = async () => {
    const res = await fetch("/api/admin/categories", { headers });
    const data = await res.json();
    setCategories(data.categories ?? []);
  };

  const loadItems = async (categoryId?: string) => {
    setLoading(true);
    const url = categoryId ? `/api/admin/items?category_id=${categoryId}` : "/api/admin/items";
    const res = await fetch(url, { headers });
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (token === null) return;
    loadCategories();
    loadItems();
  }, [token]);

  const createItem = async () => {
    setError(null);
    const res = await fetch("/api/admin/items", {
      method: "POST",
      headers,
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create");
      return;
    }
    setForm({
      category_id: "",
      name: "",
      description: "",
      price: 0,
      is_available: true,
      sort_order: 1
    });
    await loadItems(filter === "all" ? undefined : filter);
  };

  const updateItem = async (id: string, patch: Partial<ItemForm>) => {
    await fetch(`/api/admin/items/${id}`, { method: "PUT", headers, body: JSON.stringify(patch) });
    await loadItems(filter === "all" ? undefined : filter);
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/items/${id}`, { method: "DELETE", headers });
    await loadItems(filter === "all" ? undefined : filter);
  };

  const toggleAvailability = async (id: string, next: boolean) => {
    await fetch(`/api/admin/items/${id}/availability`, {
      method: "POST",
      headers,
      body: JSON.stringify({ is_available: next })
    });
    await loadItems(filter === "all" ? undefined : filter);
  };

  const move = async (id: string, direction: -1 | 1) => {
    const scope = filter === "all" ? items : items.filter((i) => i.category_id === filter);
    const idx = scope.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const reordered = [...scope];
    const target = idx + direction;
    if (target < 0 || target >= reordered.length) return;
    [reordered[idx], reordered[target]] = [reordered[target], reordered[idx]];
    const order = reordered.map((i) => i.id);
    await fetch("/api/admin/items/reorder", {
      method: "POST",
      headers,
      body: JSON.stringify({ order })
    });
    await loadItems(filter === "all" ? undefined : filter);
  };

  const filteredItems = filter === "all" ? items : items.filter((i) => i.category_id === filter);

  if (token === null) return null;

  return (
    <div className="app-shell">
      <AdminHeader />
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="flex" style={{ gap: 12 }}>
          <label style={{ marginBottom: 0 }}>Filter</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={() => loadItems(filter === "all" ? undefined : filter)}>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 18 }}>
        <div className="card">
          <div className="flex-between">
            <h2 style={{ margin: 0 }}>Items</h2>
            {loading && <span className="pill">Loading…</span>}
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Avail</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{categories.find((c) => c.id === item.category_id)?.name ?? "—"}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => toggleAvailability(item.id, !item.is_available)}
                    >
                      {item.is_available ? "Available" : "Sold out"}
                    </button>
                  </td>
                  <td>
                    <div className="flex" style={{ gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => move(item.id, -1)}>
                        ▲
                      </button>
                      <button className="btn btn-secondary" onClick={() => move(item.id, 1)}>
                        ▼
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => deleteItem(item.id)}
                        style={{ background: "#2b1a1a", color: "#fecdd3" }}
                      >
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
          <h3 style={{ marginTop: 0 }}>Add Item</h3>
          <div className="grid" style={{ gap: 12 }}>
            <div>
              <label>Category</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label>Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
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
                checked={form.is_available}
                onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
                style={{ width: 18 }}
              />
              <span>Available</span>
            </div>
            {error && <div className="badge badge-danger">{error}</div>}
            <button className="btn" onClick={createItem} disabled={!form.name || !form.category_id}>
              Create item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
