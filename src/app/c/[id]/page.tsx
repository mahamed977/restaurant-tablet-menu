"use client";

import { useParams, useRouter } from "next/navigation";
import OfflineOverlay from "../../../components/Offline";
import { MenuItemList } from "../../../components/MenuItemList";
import { useMenuPolling } from "../../../hooks/useMenuPolling";
import { useIdleReset } from "../../../hooks/useIdleReset";
import Link from "next/link";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { menu, offline, loading } = useMenuPolling();
  useIdleReset(true);

  const category = menu?.find((c) => c.id === params?.id);

  if (!loading && !category) {
    return (
      <div className="app-shell">
        <div className="card">
          <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>Category not found</div>
          <div className="spacer" />
          <button className="btn" onClick={() => router.push("/")}>
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <OfflineOverlay visible={offline} />
      <div className="flex-between" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: "2rem", fontWeight: 800 }}>{category?.name ?? "Loading…"}</div>
          <Link href="/" className="pill">
            ← All categories
          </Link>
        </div>
        <div className="pill">Tap item to view details</div>
      </div>
      {loading && <div className="card">Loading items…</div>}
      {category && <MenuItemList items={category.items} />}
    </div>
  );
}
