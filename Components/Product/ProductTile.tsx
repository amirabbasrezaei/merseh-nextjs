import Image from "next/image";
import Link from "next/link";
import splitNumber from "@/Components/utils/splitNumber";
import { getPriceInfo } from "@/Components/utils/pricing";
import { toPathSlug } from "@/utils/slug";

export type ProductBrandLink = {
  id: number;
  name: string;
};

export type ProductTileData = {
  id: number;
  name: string;
  price: number;
  discount?: number;
  freeShipping?: boolean;
  imageUrl: string;
  imageNames?: string[];
  brand?: ProductBrandLink | null;
};

export type ProductTileSurface = "ivory" | "white";

const surfaceClass: Record<ProductTileSurface, string> = {
  ivory: "bg-ivory",
  white: "bg-white",
};

type Props = {
  product: ProductTileData;
  sizes: string;
  surface?: ProductTileSurface;
};

export default function ProductTile({
  product,
  sizes: imageSizes,
  surface = "ivory",
}: Props) {
  const {
    id,
    name,
    imageUrl,
    imageNames,
    price,
    discount = 0,
    freeShipping,
    brand,
  } = product;
  const href = `/product/${id}/${toPathSlug(name)}`;
  const secondary = imageNames?.find((src) => src && src !== imageUrl);
  const { payable, percent, hasDiscount } = getPriceInfo(price, discount);
  const imageClass = secondary
    ? "object-contain p-[9%] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0 motion-reduce:transition-none"
    : "home-zoom object-contain p-[9%] mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.05]";

  return (
    <article className="group flex h-full flex-col">
      <Link href={href} className="home-focus block rounded-tile">
        <div
          className={`home-motion relative isolate aspect-square w-full overflow-hidden rounded-tile group-hover:bg-blush-100 group-hover:shadow-float ${surfaceClass[surface]}`}
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              quality={75}
              className={imageClass}
              sizes={imageSizes}
            />
          ) : null}
          {secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              quality={75}
              className="object-contain p-[9%] opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none"
              sizes={imageSizes}
            />
          ) : null}
          {hasDiscount ? (
            <span
              aria-hidden
              className="absolute start-3 top-3 z-10 rounded-full bg-plum-900 px-2.5 py-1 text-caption font-medium text-ivory"
            >
              {percent}٪
            </span>
          ) : null}
          {freeShipping ? (
            <span className="absolute end-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-caption font-medium text-mauve-700 shadow-card">
              ارسال رایگان
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 px-1 pt-4">
        {brand ? (
          <Link
            href={`/brand/${brand.id}/${toPathSlug(brand.name)}`}
            className="home-focus w-fit text-caption font-medium text-mauve-600 hover:text-mauve-700"
          >
            {brand.name}
          </Link>
        ) : (
          <span className="h-[18px]" />
        )}
        <Link href={href} className="home-focus flex flex-1 flex-col">
          <h3 className="home-motion line-clamp-2 min-h-[42px] text-h3 text-plum-900 group-hover:text-mauve-700 md:min-h-12 md:text-h3-md">
            {name}
          </h3>
        </Link>
        <Link
          href={href}
          className="home-focus mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5"
        >
          <span className="text-h3-md font-semibold text-plum-900">
            {splitNumber(payable)}
            <span className="ms-1 text-caption font-normal text-lightBlack">
              تومان
            </span>
          </span>
          {hasDiscount ? (
            <span className="text-caption text-lightBlack line-through decoration-mauve-400">
              {splitNumber(price)}
            </span>
          ) : null}
        </Link>
      </div>
    </article>
  );
}
