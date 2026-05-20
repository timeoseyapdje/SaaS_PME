import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Nkap Control";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          fontFamily: "sans-serif",
          gap: 32,
        }}
      >
        {/* Logo */}
        <img
          src="https://nkapcontrol.com/logo.jpeg"
          width={160}
          height={160}
          style={{ borderRadius: 0 }}
        />

        {/* Name */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#166534",
              letterSpacing: -2,
              lineHeight: 1,
              display: "flex",
            }}
          >
            NKAP
          </span>
          <span
            style={{
              fontSize: 60,
              fontWeight: 600,
              color: "#166534",
              letterSpacing: -1,
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            CONTROL
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
