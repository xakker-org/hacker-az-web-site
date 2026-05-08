import { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale  = useTransform(scrollYProgress, [0, 1], isMobile ? [0.8, 0.9] : [1.05, 1]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      style={{
        height: isMobile ? "auto" : "180vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: isMobile ? "80px 16px" : "0 clamp(16px,4vw,48px)",
        background: "transparent",
      }}
    >
      <div
        style={{
          position: isMobile ? "relative" : "sticky",
          top: 0,
          height: isMobile ? "auto" : "100vh",
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "44px",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{ translateY, width: "100%", textAlign: "center", zIndex: 2 }}
        >
          {titleComponent}
        </motion.div>

        {/* 3D perspective card */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            transformPerspective: 1400,
            transformOrigin: "50% 0%",
            width: "100%",
            maxWidth: "1000px",
            borderRadius: "18px",
            border: "2px solid rgba(255,255,255,0.08)",
            background: "#0a0d14",
            padding: "4px",
            boxShadow:
              "0 0 0 1px rgba(255,77,103,0.06)," +
              "0 4px 8px rgba(0,0,0,0.3)," +
              "0 16px 32px rgba(0,0,0,0.4)," +
              "0 40px 80px rgba(0,0,0,0.4)," +
              "0 80px 160px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              background: "#07090f",
              borderRadius: "15px",
              overflow: "hidden",
              height: isMobile ? "280px" : "480px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
