"use client";

import { useEffect, useState } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeInSectionProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

const editorialEase = [0.22, 1, 0.36, 1] as const;

/** Animate only after mount to avoid SSR/client hydration mismatches. */
export function FadeInSection({ children, delay = 0, className, ...props }: FadeInSectionProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <motion.div
      initial={ready ? { opacity: 0, y: 18 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.75, delay, ease: editorialEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGrid({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <motion.div
      initial={ready ? "hidden" : false}
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: editorialEase },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
