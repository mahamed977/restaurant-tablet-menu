export type Category = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url: string | null;
  sort_order: number;
  updated_at: string;
};

export type CategoryWithItems = Category & {
  items: MenuItem[];
};

export type AdminRole = "admin" | "staff";
