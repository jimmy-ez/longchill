import Image from "next/image";
import "./page.css";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <>
      {/* Full-screen overlay that covers Navbar & Footer */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        // backgroundImage: "url('/hero-bg-1.png')",
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        backgroundColor: "#000",
      }}>
        {/* Dark overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "0 1.5rem" }} className="animate-fade-in-up">
          <Image
            src="/logo-white.png"
            alt="Longchill"
            width={200}
            height={72}
            priority
            style={{ width: "auto", height: "auto", marginBottom: "1.5rem" }}
          />
          <h1 style={{
            fontSize: "clamp(2.5rem, 8vw, 5rem)",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "0.08em",
            margin: 0,
          }}>
            Coming Soon
          </h1>
          <p style={{ color: "#9d9999", marginTop: "0.5rem", fontSize: "1rem", fontStyle: "italic" }}>
            เร็ว ๆ นี้
          </p>
        </div>

        {/* Social links */}
        {/* <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "1.25rem", marginTop: "0.5rem" }} className="animate-fade-in-up">
          <a href="https://lin.ee/QbUYUCS" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/line.png" alt="LINE OA" width={42} height={42} />
          </a>
          <a href="https://www.facebook.com/Longchillbar" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/facebook.png" alt="Facebook" width={42} height={42} />
          </a>
          <a href="https://www.instagram.com/longchill.bar" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/ig.png" alt="Instagram" width={42} height={42} />
          </a>
          <a href="https://www.tiktok.com/@longchill.bar" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/tiktok.png" alt="TikTok" width={42} height={42} />
          </a>
        </div> */}
      </div>
    </>
  );
}

