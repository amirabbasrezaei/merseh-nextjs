"use client";

import { toPathSlug } from "@/utils/slug";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "./ui/SectionHeader";

const MIN_TILES = 16;

type Brand = {
  id: number;
  name: string;
  logoUrl: string | null;
};

function fillStrip(brands: Brand[]) {
  if (!brands.length) return [];
  const filled: Brand[] = [];
  while (filled.length < Math.max(MIN_TILES, brands.length)) {
    filled.push(...brands);
  }
  return filled.slice(0, Math.max(MIN_TILES, brands.length));
}

function BrandTile({
  brand,
  hidden,
}: {
  brand: Brand;
  hidden?: boolean;
}) {
  return (
    <Link
      href={`/brand/${brand.id}/${toPathSlug(brand.name)}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="home-focus group flex h-20 w-36 shrink-0 items-center justify-center bg-ivory"
    >
      {brand.logoUrl ? (
        <Image
          src={brand.logoUrl}
          alt={hidden ? "" : brand.name}
          width={128}
          height={56}
          className="home-motion h-12 w-auto max-w-full object-contain opacity-60 mix-blend-multiply grayscale group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
        />
      ) : (
        <span className="home-motion line-clamp-2 text-center text-h3-md font-medium text-plum-900/60 group-hover:text-plum-900">
          {brand.name}
        </span>
      )}
    </Link>
  );
}

export default function BrandStrip() {
  const { data, isLoading } = trpc.brand.listActive.useQuery();
  const brands = data?.brands ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10" aria-hidden>
        <div className="flex flex-col gap-3 border-b border-hairline pb-5">
          <div className="h-3 w-24 animate-pulse rounded-full bg-blush-200" />
          <div className="h-8 w-40 animate-pulse rounded-full bg-blush-200" />
        </div>
        <div className="flex gap-12 overflow-hidden">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-12 w-28 shrink-0 animate-pulse rounded-full bg-blush-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!brands.length) return null;

  const tiles = fillStrip(brands);

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      <SectionHeader
        eyebrow="فقط برندهای اصل"
        title="برندهای محبوب"
        href="/brands"
        linkLabel="همه برندها"
      />
      <div
        className="home-marquee-wrap mx-[calc(50%_-_50vw)] overflow-hidden"
        dir="ltr"
      >
        <div className="home-marquee flex w-max">
          <div className="flex gap-12 pe-12 md:gap-16 md:pe-16">
            {tiles.map((brand, index) => (
              <BrandTile
                key={`${brand.id}-${index}`}
                brand={brand}
                hidden={index >= brands.length}
              />
            ))}
          </div>
          <div
            className="home-marquee-copy flex gap-12 pe-12 md:gap-16 md:pe-16"
            aria-hidden
          >
            {tiles.map((brand, index) => (
              <BrandTile
                key={`copy-${brand.id}-${index}`}
                brand={brand}
                hidden
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
