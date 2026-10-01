"use client";

import classNames from "classnames";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  layoutId: string;
  className?: string;
};

/** Glass capsule that glides between active items sharing the same `layoutId`. Render it inside a `relative isolate` item. */
export default function GlassThumb({ layoutId, className }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      layoutId={layoutId}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 420, damping: 34, mass: 0.8 }
      }
      className={classNames(
        "glass pointer-events-none absolute inset-0 -z-10 rounded-full",
        className,
      )}
    />
  );
}
