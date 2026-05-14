import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nkap Control — Gestion financière pour PME camerounaises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top green bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: "#15803d", display: "flex" }} />

        {/* Logo icon */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            background: "linear-gradient(135deg, #052e16, #15803d)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
            boxShadow: "0 8px 32px rgba(21,128,61,0.25)",
          }}
        >
          <div style={{ fontSize: 54, display: "flex" }}>₣</div>
        </div>

        {/* Brand name */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 80, fontWeight: 900, color: "#15803d", letterSpacing: -3, display: "flex" }}>NKAP</span>
          <span style={{ fontSize: 80, fontWeight: 400, color: "#166534", letterSpacing: -2, display: "flex" }}>CONTROL</span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: "#4b5563", fontWeight: 500, display: "flex", marginBottom: 36 }}>
          Logiciel de gestion financière pour PME camerounaises
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 14 }}>
          {["Factures", "Trésorerie", "MTN Money", "Orange Money", "Stocks"].map((label) => (
            <div
              key={label}
              style={{
                background: "#f0fdf4",
                border: "2px solid #bbf7d0",
                borderRadius: 999,
                padding: "8px 22px",
                fontSize: 20,
                color: "#15803d",
                fontWeight: 600,
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{ position: "absolute", bottom: 28, fontSize: 20, color: "#9ca3af", display: "flex" }}>
          nkapcontrol.com
        </div>

        {/* Bottom green bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 10, background: "#15803d", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
