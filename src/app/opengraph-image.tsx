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
          background: "linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: 52, display: "flex" }}>💰</div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: -2,
            marginBottom: 16,
            display: "flex",
          }}
        >
          Nkap Control
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: "#6ee7b7",
            fontWeight: 500,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          Logiciel de gestion financière pour PME camerounaises
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {["Factures", "Trésorerie", "MTN Money", "Orange Money", "Stocks"].map((label) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 18,
                color: "#d1fae5",
                display: "flex",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            color: "rgba(255,255,255,0.4)",
            display: "flex",
          }}
        >
          nkapcontrol.com
        </div>
      </div>
    ),
    { ...size }
  );
}
