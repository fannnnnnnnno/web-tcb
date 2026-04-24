export default function Loading() {
  function Shimmer({ w = "100%", h = "14px", r = "6px" }: { w?: string; h?: string; r?: string }) {
    return (
      <div style={{ width: w, height: h, borderRadius: r, background: "var(--skeleton-bg)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)", animation: "shimmer 1.5s ease-in-out infinite" }} />
        <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Shimmer w="180px" h="28px" r="8px" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px" }}>
        {Array.from({length:4}).map((_,i) => <Shimmer key={i} w="100%" h="80px" r="12px" />)}
      </div>
      {Array.from({length:5}).map((_,i) => (
        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
          <Shimmer w="32px" h="32px" r="50%" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <Shimmer w="40%" h="13px" />
            <Shimmer w="25%" h="10px" />
          </div>
          <Shimmer w="60px" h="13px" />
        </div>
      ))}
    </div>
  );
}
