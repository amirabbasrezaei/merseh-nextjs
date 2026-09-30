import Image from "next/image";
import Link from "next/link";
import splitNumber from "@/Components/utils/splitNumber";
import { toPathSlug } from "@/utils/slug";
import type { ProductBrandLink } from "./ProductCarousel";

type Props = {
  id: number;
  name: string;
  imageUrl: string;
  imageNames?: string[];
  price: number;
  brand?: ProductBrandLink | null;
};

export default function ProductCarouselItem({
  id,
  name,
  imageUrl,
  imageNames,
  price,
  brand,
}: Props) {
  const href = `/product/${id}/${toPathSlug(name)}`;
  const secondary = imageNames?.find((src) => src && src !== imageUrl);
  const imageClass = secondary
    ? "home-motion object-contain group-hover:opacity-0"
    : "home-zoom home-motion object-contain group-hover:scale-[1.03]";

  return (
    <article className="home-motion group flex h-full flex-col rounded-card border border-line bg-white p-4 shadow-card hover:shadow-raised">
      <Link href={href} className="home-focus flex flex-1 flex-col gap-3">
        <div className="relative aspect-square w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              quality={70}
              className={imageClass}
              sizes="(max-width: 639px) 62vw, (max-width: 767px) 42vw, (max-width: 1023px) 30vw, 240px"
            />
          ) : null}
          {secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              quality={70}
              className="home-motion object-contain opacity-0 group-hover:opacity-100"
              sizes="(max-width: 639px) 62vw, (max-width: 767px) 42vw, (max-width: 1023px) 30vw, 240px"
            />
          ) : null}
        </div>
        <h3 className="line-clamp-2 min-h-[42px] text-h3 text-black1 md:min-h-12 md:text-h3-md">
          {name}
        </h3>
      </Link>
      {brand ? (
        <Link
          href={`/brand/${brand.id}/${toPathSlug(brand.name)}`}
          className="home-focus mt-1 w-fit text-caption text-lightBlack hover:text-green2"
        >
          {brand.name}
        </Link>
      ) : (
        <span className="mt-1 h-4" />
      )}
      <Link href={href} className="home-focus mt-3 text-small text-green1">
        {splitNumber(price)} <span className="text-caption text-black1">تومان</span>
      </Link>
    </article>
  );
}
