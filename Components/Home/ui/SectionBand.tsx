import type { ReactNode } from "react";

type Tone = "white" | "tint" | "surface";

const toneClass: Record<Tone, string> = {
  white: "bg-white",
  tint: "bg-tint",
  surface: "bg-hover1",
};

type Props = {
  children: ReactNode;
  tone?: Tone;
  labelledBy?: string;
};

export default function SectionBand({
  children,
  tone = "white",
  labelledBy,
}: Props) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`empty:hidden w-full py-10 empty:py-0 md:py-16 md:empty:py-0 ${toneClass[tone]}`}
    >
      {children}
    </section>
  );
}
