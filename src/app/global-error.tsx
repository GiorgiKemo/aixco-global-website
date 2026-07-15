"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F3EDE1", color: "#161616", fontFamily: "Arial, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <section style={{ width: "min(620px, 100%)", boxSizing: "border-box", border: "1px solid rgba(22,22,22,.16)", background: "#fff", padding: "48px 40px" }}>
            <p style={{ margin: 0, color: "#8b6a18", fontSize: 12, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>AIXCO.Global</p>
            <h1 style={{ margin: "22px 0 0", fontSize: "clamp(38px, 8vw, 64px)", lineHeight: 1, letterSpacing: -2 }}>Something went wrong.</h1>
            <p style={{ margin: "22px 0 0", fontSize: 17, lineHeight: 1.65, color: "#55534f" }}>Please try again. If the problem continues, contact info@aixco.global.</p>
            <button type="button" onClick={reset} style={{ marginTop: 30, minHeight: 46, border: 0, background: "#161616", color: "#fff", padding: "0 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
