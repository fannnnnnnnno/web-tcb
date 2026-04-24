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
      <div style={{ maxWidth: "672px", margin: "0 auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Shimmer w="40px" h="4px" r="4px" />
          <Shimmer w="200px" h="32px" r="8px" />
          <Shimmer w="150px" h="14px" r="6px" />
        </div>
        {Array.from({length:4}).map((_,i) => (
          <div key={i} style={{ display: "flex", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <Shimmer w="12px" h="12px" r="50%" />
              <div style={{ width: "2px", height: "80px", background: "var(--skeleton-bg)" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", paddingBottom: "16px" }}>
              <Shimmer w="40%" h="14px" />
              <Shimmer w="70%" h="12px" />
              <Shimmer w="55%" h="12px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
