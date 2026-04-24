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
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
        <Shimmer w="120px" h="60px" r="8px" />
        <Shimmer w="200px" h="16px" r="6px" />
        <Shimmer w="160px" h="14px" r="6px" />
        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#E01E2B", animation: `pulse 0.8s ease-in-out ${i*0.15}s infinite` }} />
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{transform:scale(0.5);opacity:0.3}50%{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  );
}
