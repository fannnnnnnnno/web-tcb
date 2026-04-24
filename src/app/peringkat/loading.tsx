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
      <div style={{ maxWidth: "672px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <Shimmer w="40px" h="4px" r="4px" />
          <Shimmer w="220px" h="36px" r="8px" />
          <Shimmer w="120px" h="14px" r="6px" />
        </div>
        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "32px", flexWrap: "wrap" }}>
          {["Global","Tekken 8","Street Fighter 6","Dead or Alive 6"].map(g => (
            <Shimmer key={g} w="90px" h="32px" r="20px" />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "16px", marginBottom: "48px" }}>
          {[{h:64,w:48},{h:88,w:56},{h:48,w:44}].map((item,i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Shimmer w={`${item.w}px`} h={`${item.w}px`} r="50%" />
              <Shimmer w="60px" h="11px" />
              <Shimmer w="36px" h="10px" />
              <div style={{ width: "80px", height: `${item.h}px`, borderRadius: "8px 8px 0 0", background: "var(--skeleton-bg)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent)", animation: "shimmer 1.5s ease-in-out infinite" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({length:5}).map((_,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <Shimmer w="28px" h="28px" r="50%" />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <Shimmer w="42%" h="13px" />
                <Shimmer w="26%" h="10px" />
              </div>
              <Shimmer w="44px" h="13px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
