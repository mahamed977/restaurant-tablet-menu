import { HIDE_SOLD_OUT } from "../config/display";
import { MenuItem } from "../types";
import clsx from "clsx";

type Props = {
  items: MenuItem[];
};

export function MenuItemList({ items }: Props) {
  const visible = HIDE_SOLD_OUT ? items.filter((i) => i.is_available) : items;

  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      {visible.map((item) => (
        <div
          key={item.id}
          className="card"
          style={{ opacity: item.is_available ? 1 : 0.6, display: "flex", flexDirection: "column", gap: 10 }}
        >
          <div className="flex-between">
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{item.name}</div>
            {!item.is_available && <span className={clsx("badge", "badge-danger")}>Sold out</span>}
          </div>
          {item.description && <div style={{ color: "#cbd5e1", minHeight: 40 }}>{item.description}</div>}
          <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#e0f2fe" }}>${Number(item.price).toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}
