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
    <div style={{ minHeight: "100vh", paddingTop: "80px", backgroundColor: "var(--bg-primary)" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Shimmer w="96px" h="96px" r="50%" />
          <Shimmer w="160px" h="20px" r="8px" />
          <Shimmer w="100px" h="14px" r="6px" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          {Array.from({length:3}).map((_,i) => <Shimmer key={i} w="100%" h="64px" r="10px" />)}
        </div>
        {Array.from({length:4}).map((_,i) => <Shimmer key={i} w="100%" h="44px" r="10px" />)}
      </div>
    </div>
  );
}
