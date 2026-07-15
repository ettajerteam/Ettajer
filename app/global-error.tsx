"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f5f5f7" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              width: "100%",
              background: "#fff",
              borderRadius: "16px",
              padding: "32px",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
          >
            <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              {error.message || "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#007AFF",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "12px 24px",
                fontSize: "15px",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                color: "#007AFF",
                fontSize: "15px",
                textDecoration: "none",
                padding: "12px 16px",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
