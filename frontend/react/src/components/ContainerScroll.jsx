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
        padding: isMobile ? "80px 16px" : "0 20px",
        background: "linear-gradient(180deg,#04070c 0%,#08111b 60%,#0f1b2d 100%)",
      }}
    >
      {/* sticky içlik */}
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
          gap: "40px",
          overflow: "hidden",
        }}
      >
        {/* Başlıq */}
        <motion.div
          style={{ translateY, width: "100%", textAlign: "center", zIndex: 2 }}
        >
          {titleComponent}
        </motion.div>

        {/* 3D kart */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            transformPerspective: 1200,
            transformOrigin: "50% 0%",
            width: "100%",
            maxWidth: "1000px",
            borderRadius: "30px",
            border: "4px solid #6c6c6c",
            background: "#222",
            padding: "6px",
            boxShadow:
              "0 0 #0000004d,0 9px 20px #0000004a,0 37px 37px #00000042," +
              "0 84px 50px #00000026,0 149px 60px #0000000a,0 233px 65px #00000003",
          }}
        >
          <div
            style={{
              background: "#111318",
              borderRadius: "22px",
              overflow: "hidden",
              height: isMobile ? "300px" : "500px",
            }}
          >
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
