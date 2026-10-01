import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Chevron_Down_sharp_light } from "../../SVGS";

type Props = {
  id?: string;
  title: ReactNode;
  eyebrow?: string;
  logoUrl?: string | null;
  href?: string | null;
  linkLabel?: string;
  actions?: ReactNode;
  mark?: ReactNode;
  titleClassName?: string;
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-2.5 text-eyebrow text-mauve-600">
      <span aria-hidden className="h-px w-6 bg-mauve-400" />
      {children}
    </span>
  );
}

export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="home-focus group inline-flex shrink-0 items-center gap-1.5 text-small font-medium text-plum-900 hover:text-mauve-700"
    >
      {children}
      <Chevron_Down_sharp_light classname="home-motion h-4 w-4 rotate-90 fill-current group-hover:-translate-x-1" />
    </Link>
  );
}

export default function SectionHeader({
  id,
  title,
  eyebrow,
  logoUrl,
  href,
  linkLabel = "مشاهده همه",
  actions,
  mark,
  titleClassName = "text-display-lg text-plum-900",
}: Props) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-hairline pb-5">
      <div className="flex min-w-0 flex-col gap-3">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <div className="flex min-w-0 items-center gap-3">
          {mark}
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt=""
              width={40}
              height={40}
              className="h-9 w-9 shrink-0 object-contain md:h-10 md:w-10"
            />
          ) : null}
          <h2 id={id} className={`min-w-0 truncate ${titleClassName}`}>
            {title}
          </h2>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-5 pb-1.5">
        {href ? <ArrowLink href={href}>{linkLabel}</ArrowLink> : null}
        {actions}
      </div>
    </div>
  );
}
