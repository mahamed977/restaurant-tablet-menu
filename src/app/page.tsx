"use client";

import Link from "next/link";
import OfflineOverlay from "../components/Offline";
import { CategoryGrid } from "../components/CategoryGrid";
import { useMenuPolling } from "../hooks/useMenuPolling";
import { useIdleReset } from "../hooks/useIdleReset";

export default function HomePage() {
  const { menu, offline, loading } = useMenuPolling();
  useIdleReset(true);

  return (
    <div className="app-shell">
      <OfflineOverlay visible={offline} />
      <header className="flex-between" style={{ marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>Menu</div>
          <div style={{ color: "#cbd5e1" }}>Tap a category to view items</div>
        </div>
        <Link href="/admin/login" className="pill">
          Staff
        </Link>
      </header>
      {loading && <div className="card">Loading menu…</div>}
      {menu && menu.length === 0 && <div className="card">No categories yet.</div>}
      {menu && menu.length > 0 && <CategoryGrid categories={menu} />}
    </div>
  );
}
