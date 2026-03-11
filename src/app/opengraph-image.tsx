import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Lawnbowling — Tournament management, club directory, and everything lawn bowling";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #388E3C 70%, #1B5E20 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative bowling green circles */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 200,
            left: 100,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            display: "flex",
          }}
        />

        {/* Jack (small white ball) */}
        <div
          style={{
            position: "absolute",
            top: 140,
            right: 220,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {/* Bowls icon cluster */}
          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#C62828",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#1565C0",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#F9A825",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex",
              }}
            />
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "#FFFFFF",
                border: "3px solid rgba(255,255,255,0.3)",
                display: "flex",
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: "#FFFFFF",
              letterSpacing: "-2px",
              lineHeight: 1,
              textShadow: "0 4px 12px rgba(0,0,0,0.2)",
              display: "flex",
            }}
          >
            Lawnbowling
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "rgba(255,255,255,0.85)",
              marginTop: 8,
              display: "flex",
            }}
          >
            The World&apos;s Best Lawn Bowling App
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            {["Tournaments", "Club Directory", "Live Scoring", "50+ Clubs"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 999,
                    padding: "8px 20px",
                    fontSize: 18,
                    fontWeight: 500,
                    color: "#FFFFFF",
                    display: "flex",
                  }}
                >
                  {feature}
                </div>
              )
            )}
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 20,
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "1px",
            display: "flex",
          }}
        >
          lawnbowl.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
