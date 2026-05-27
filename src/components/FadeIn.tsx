"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className = "", delay = 0 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const el = ref.current;
    if (!el) return;

    if (mq.matches) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
              // Clean up will-change after transition ends to free GPU memory
              // and prevent Safari compositing conflicts during scroll
              el.addEventListener(
                "transitionend",
                () => {
                  el.style.willChange = "auto";
                },
                { once: true }
              );
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={
        prefersReducedMotion
          ? {}
          : {
              opacity: 0,
              transform: "translateY(20px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
              willChange: "opacity, transform",
            }
      }
    >
      {children}
    </div>
  );
}
