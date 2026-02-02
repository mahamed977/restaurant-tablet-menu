import OfflineOverlay from "../Offline";
import { ReactNode } from "react";

type Props = {
  updatedLabel?: string;
  offline: boolean;
  children: ReactNode;
};

export function MenuShell({ updatedLabel, offline, children }: Props) {
  return (
    <div className="ub-shell">
      <OfflineOverlay visible={offline} />
      <header className="ub-topbar">
        <div className="ub-brand">Unique Bites</div>
        <div className={`ub-status ${offline ? "ub-status-offline" : "ub-status-online"}`}>
          {offline ? "Offline" : updatedLabel ? `Updated: ${updatedLabel}` : "Online"}
        </div>
      </header>
      <main className="ub-main">{children}</main>
    </div>
  );
}
