"use client";

import classNames from "classnames";
import type { ReactNode } from "react";
import { useReveal } from "./Reveal";

export type Tone = "plain" | "ivory";

type Props = {
  children: ReactNode;
  tone?: Tone;
  bleed?: boolean;
  labelledBy?: string;
  className?: string;
};

export default function Section({
  children,
  tone = "plain",
  bleed = false,
  labelledBy,
  className,
}: Props) {
  const { ref, revealClass } = useReveal();

  return (
    <section
      ref={ref}
      aria-labelledby={labelledBy}
      className={classNames(
        "empty:hidden",
        bleed ? "bleed" : "w-full",
        revealClass,
        tone === "ivory" && "bg-ivory py-section",
        className,
      )}
    >
      {children}
    </section>
  );
}
