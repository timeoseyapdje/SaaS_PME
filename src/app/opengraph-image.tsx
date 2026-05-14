import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nkap Control — Gestion financière pour PME camerounaises";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nkap-control.vercel.app";

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
        {/* Subtle green bar on top */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #15803d, #16a34a, #15803d)",
            display: "flex",
          }}
        />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${APP_URL}/logo.jpeg`}
          width={420}
          height={420}
          alt="Nkap Control"
          style={{ objectFit: "contain", marginBottom: 16 }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            color: "#15803d",
            fontWeight: 700,
            letterSpacing: 0.5,
            display: "flex",
          }}
        >
          Gestion financière pour PME camerounaises
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {["Factures", "Trésorerie", "MTN Money", "Orange Money"].map((label) => (
            <div
              key={label}
              style={{
                background: "#f0fdf4",
                border: "1.5px solid #bbf7d0",
                borderRadius: 999,
                padding: "6px 18px",
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
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 18,
            color: "#9ca3af",
            display: "flex",
          }}
        >
          nkapcontrol.com
        </div>

        {/* Bottom green bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #15803d, #16a34a, #15803d)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
