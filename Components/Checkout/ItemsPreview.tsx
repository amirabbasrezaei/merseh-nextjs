import Image from "next/image";
import Link from "next/link";
import type { CheckoutOrder } from "./types";

const MAX_THUMBNAILS = 4;

export default function ItemsPreview({ items }: { items: CheckoutOrder["items"] }) {
  const shown = items.slice(0, MAX_THUMBNAILS);
  const hidden = items.length - shown.length;

  return (
    <div className="flex items-center justify-between gap-3">
      <ul className="flex items-center gap-2" aria-label="کالاهای سفارش">
        {shown.map((item) => (
          <li
            key={`${item.productId}-${item.variationValueId ?? "base"}`}
            className="relative h-12 w-12 flex-none rounded-card bg-sand"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="48px"
                className="rounded-card object-cover"
              />
            ) : null}
            {item.numberOfProduct > 1 ? (
              <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-plum-900 px-1 text-[11px] text-white">
                {item.numberOfProduct}
              </span>
            ) : null}
          </li>
        ))}
        {hidden > 0 ? (
          <li className="flex h-12 w-12 items-center justify-center rounded-card bg-blush-100 text-caption font-medium text-mauve-700">
            +{hidden}
          </li>
        ) : null}
      </ul>
      <Link
        href="/cart/checkout"
        className="home-focus shrink-0 rounded-full whitespace-nowrap text-caption font-medium text-mauve-700 hover:text-plum-900"
      >
        ویرایش سبد
      </Link>
    </div>
  );
}
