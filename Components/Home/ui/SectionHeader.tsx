import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  id?: string;
  title: string;
  logoUrl?: string | null;
  href?: string | null;
  linkLabel?: string;
  actions?: ReactNode;
};

export default function SectionHeader({
  id,
  title,
  logoUrl,
  href,
  linkLabel = "مشاهده همه",
  actions,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
          />
        ) : null}
        <h2 id={id} className="text-h2 text-black1 md:text-h2-md">
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {href ? (
          <Link href={href} className="home-focus text-small text-green2">
            {linkLabel}
          </Link>
        ) : null}
        {actions}
      </div>
    </div>
  );
}
