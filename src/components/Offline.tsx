type Props = {
  visible: boolean;
};

export default function OfflineOverlay({ visible }: Props) {
  if (!visible) return null;
  return (
    <div className="offline-overlay">
      <div style={{ fontSize: "2rem", fontWeight: 700 }}>No internet</div>
      <div style={{ color: "#cbd5e1" }}>Please ask your waiter. Reconnecting…</div>
    </div>
  );
}
