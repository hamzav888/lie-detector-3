import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// A static route at /og.png: rendered once at build time and written to
// out/og.png with a real extension, so GitHub Pages serves it as image/png.
// (The opengraph-image file convention emits an extensionless file, which
// Pages would serve as octet-stream — some social scrapers reject that.)
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#2E7BFF",
          backgroundImage: "radial-gradient(rgba(26,16,48,0.16) 3px, transparent 3px)",
          backgroundSize: "28px 28px",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "8px solid #1A1030",
            borderRadius: 48,
            background: "#FFF8EE",
            boxShadow: "0 20px 0 #1A1030",
            padding: "52px 60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "#FF2D95",
                border: "6px solid #1A1030",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 0 #1A1030",
              }}
            >
              <svg viewBox="0 0 24 24" width="40" height="40">
                <path d="M4 18 A8 8 0 0 1 20 18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="12" y1="18" x2="16.5" y2="10.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
                <circle cx="12" cy="18" r="2.2" fill="#fff" />
              </svg>
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#1A1030" }}>{SITE.name}</div>
            <div
              style={{
                marginLeft: "auto",
                padding: "10px 22px",
                borderRadius: 999,
                border: "5px solid #1A1030",
                background: "#B6FF2E",
                fontSize: 24,
                fontWeight: 800,
                color: "#1A1030",
              }}
            >
              TRY IT IN YOUR BROWSER
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 0.95, color: "#1A1030", letterSpacing: -3 }}>
              CAN YOUR FACE
            </div>
            <div style={{ fontSize: 104, fontWeight: 900, lineHeight: 0.95, color: "#FF2D95", letterSpacing: -3 }}>
              KEEP A SECRET?
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#1A1030", opacity: 0.75 }}>
              The lie-detector party game · iOS &amp; Android soon
            </div>
            <div
              style={{
                padding: "12px 26px",
                borderRadius: 999,
                border: "5px solid #1A1030",
                background: "#FFD200",
                fontSize: 26,
                fontWeight: 800,
                color: "#1A1030",
              }}
            >
              FOR ENTERTAINMENT
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
