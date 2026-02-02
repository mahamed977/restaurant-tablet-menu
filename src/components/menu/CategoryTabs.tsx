import Link from "next/link";
import { Category } from "../../types";

type Props = {
  categories: Category[];
  activeId: string | null;
  onSelect?: (id: string) => void;
  sticky?: boolean;
};

export function CategoryTabs({ categories, activeId, onSelect, sticky = true }: Props) {
  return (
    <div className={`ub-tabs ${sticky ? "ub-tabs-sticky" : ""}`}>
      <div className="ub-tabs-scroll">
        {categories.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              className={`ub-tab ${active ? "ub-tab-active" : ""}`}
              onClick={() => onSelect?.(c.id)}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      {/* Link for direct route compatibility */}
      {activeId && (
        <Link href={`/c/${activeId}`} className="ub-tab-link">
          Open category page
        </Link>
      )}
    </div>
  );
}
