import Link from "next/link";

export default function NotFound() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 - Page Not Found</h1>
            <p style={{ marginBottom: "2rem", color: "#666" }}>The page you are looking for does not exist.</p>
        </div>
    );
}
