import { supabaseAdmin } from "./supabase-service";
import { CategoryWithItems } from "../types";

export async function getPublicMenu(): Promise<CategoryWithItems[]> {
  const admin = supabaseAdmin();
  const { data: categories, error: catErr } = await admin
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (catErr || !categories) {
    throw new Error(catErr?.message || "Failed to load categories");
  }

  const { data: items, error: itemErr } = await admin
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (itemErr || !items) {
    throw new Error(itemErr?.message || "Failed to load items");
  }

  const grouped: Record<string, CategoryWithItems> = {};
  categories.forEach((c) => {
    grouped[c.id] = { ...c, items: [] };
  });

  items.forEach((item) => {
    const cat = grouped[item.category_id];
    if (cat) {
      cat.items.push(item);
    }
  });

  return Object.values(grouped);
}

export async function getMenuVersion(): Promise<number> {
  const admin = supabaseAdmin();
  const { data, error } = await admin.from("menu_meta").select("menu_version").eq("id", 1).maybeSingle();
  if (error || !data) {
    throw new Error(error?.message || "Missing menu meta");
  }
  return Number(data.menu_version);
}
