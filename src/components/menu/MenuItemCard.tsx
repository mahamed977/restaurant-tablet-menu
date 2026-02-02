import { MenuItem } from "../../types";
import { HIDE_SOLD_OUT } from "../../config/display";

type Props = {
  item: MenuItem;
};

export function MenuItemCard({ item }: Props) {
  if (HIDE_SOLD_OUT && !item.is_available) return null;
  const soldOut = !item.is_available;

  return (
    <div className={`ub-card ${soldOut ? "ub-card-soldout" : ""}`}>
      <div className="ub-card-header">
        <div className="ub-item-name">{item.name}</div>
        <div className="ub-price">
          <span className="ub-currency">ETB</span>
          {Number(item.price).toFixed(2)}
        </div>
      </div>
      {item.description && <p className="ub-desc">{item.description}</p>}
      {soldOut && <span className="ub-badge">Sold out</span>}
    </div>
  );
}
