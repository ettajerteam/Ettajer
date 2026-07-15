"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.25, 0.1, 0.25, 1] as const;

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 20,
  ...props
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function Stagger({ children, className }: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

type AnimatedNumberProps = {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
  duration?: number;
};

export function AnimatedNumber({
  value,
  suffix = "",
  decimals = 0,
  className,
  duration = 1.2,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {formatted}
      {suffix}
    </span>
  );
}

export function ScaleOnHover({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2, ease: EASE }}
      className={cn("transition-shadow duration-300 hover:shadow-md hover:shadow-neutral-200/60", className)}
    >
      {children}
    </motion.div>
  );
}
