"use client";

import { useEffect, useMemo, useState } from "react";
import { useMenuPolling } from "../hooks/useMenuPolling";
import { useIdleReset } from "../hooks/useIdleReset";
import { MenuShell } from "../components/menu/MenuShell";
import { CategoryTabs } from "../components/menu/CategoryTabs";
import { SearchBar } from "../components/menu/SearchBar";
import { MenuGrid } from "../components/menu/MenuGrid";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { CategoryWithItems } from "../types";

export default function HomePage() {
  const { menu, offline, loading } = useMenuPolling();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [updatedLabel, setUpdatedLabel] = useState<string | undefined>(undefined);
  useIdleReset(true);

  useEffect(() => {
    if (menu && menu.length > 0) {
      setActiveCategoryId((prev) => prev ?? menu[0].id);
      setUpdatedLabel(new Date().toLocaleTimeString());
    }
  }, [menu]);

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

      {loading && <div className="ub-skeleton">Loading menu…</div>}
      {!loading && menu && menu.length === 0 && <div className="ub-skeleton">No categories yet.</div>}

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
