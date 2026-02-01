import Link from "next/link";
import { CategoryWithItems } from "../types";

type Props = {
  categories: CategoryWithItems[];
};

export function CategoryGrid({ categories }: Props) {
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      {categories.map((cat) => (
        <Link key={cat.id} href={`/c/${cat.id}`}>
          <div className="card" style={{ minHeight: 140, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{cat.name}</div>
            <div className="pill" style={{ alignSelf: "flex-start" }}>
              {cat.items.length} item{cat.items.length === 1 ? "" : "s"}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
