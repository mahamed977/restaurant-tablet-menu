"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMenuPolling } from "../../../hooks/useMenuPolling";
import { useIdleReset } from "../../../hooks/useIdleReset";
import { MenuShell } from "../../../components/menu/MenuShell";
import { CategoryTabs } from "../../../components/menu/CategoryTabs";
import { SearchBar } from "../../../components/menu/SearchBar";
import { MenuGrid } from "../../../components/menu/MenuGrid";
import { MenuItemCard } from "../../../components/menu/MenuItemCard";
import { CategoryWithItems } from "../../../types";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { menu, offline, loading } = useMenuPolling();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState<string | undefined>(undefined);
  useIdleReset(true);

  useEffect(() => {
    if (!menu || menu.length === 0) return;
    const paramId = typeof params?.id === "string" ? (params.id as string) : Array.isArray(params?.id) ? params.id[0] : null;
    const fallback = menu[0]?.id;
    setActiveCategoryId(paramId && menu.find((c) => c.id === paramId) ? paramId : fallback);
    setUpdatedLabel(new Date().toLocaleTimeString());
  }, [menu, params?.id]);

  const activeCategory: CategoryWithItems | undefined = useMemo(() => {
    return menu?.find((c) => c.id === activeCategoryId);
  }, [menu, activeCategoryId]);

  const filteredItems = useMemo(() => {
    if (!activeCategory) return [];
    const q = search.trim().toLowerCase();
    if (!q) return activeCategory.items;
    return activeCategory.items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description ? item.description.toLowerCase().includes(q) : false)
    );
  }, [activeCategory, search]);

  if (!loading && !activeCategory) {
    return (
      <div className="ub-shell">
        <div className="ub-main">
          <div className="ub-skeleton">Category not found</div>
          <button className="ub-back" onClick={() => router.push("/")}>
            Back to menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <MenuShell offline={offline} updatedLabel={updatedLabel}>
      <div className="ub-controls">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryTabs
          categories={menu ?? []}
          activeId={activeCategoryId}
          onSelect={(id) => setActiveCategoryId(id)}
        />
      </div>
      {loading && <div className="ub-skeleton">Loading items…</div>}
      {activeCategory && (
        <MenuGrid>
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </MenuGrid>
      )}
    </MenuShell>
  );
}
