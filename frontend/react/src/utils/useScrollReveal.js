import { useEffect, useRef } from "react";

/**
 * Adds `.visible` to elements with `.xk-reveal` when they enter the viewport.
 * Call once at the app level or per-page.
 */
export function useScrollReveal(selector = ".xk-reveal") {
  const observerRef = useRef(null);

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current?.disconnect();
  }, [selector]);
}
