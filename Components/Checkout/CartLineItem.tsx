import Image from "next/image";
import Link from "next/link";
import type { CartItem } from "../stores/shoppingCartStore";
import { Shopping_Cart_Empty } from "../SVGS";
import FreeShippingBadge from "./FreeShippingBadge";
import Price from "./Price";
import QuantityStepper from "./QuantityStepper";

type Props = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export default function CartLineItem({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const discount = Math.min(Math.max(item.discount ?? 0, 0), item.price);
  const unitPayable = item.price - discount;
  const href = `/product/${item.productId}`;

  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0 sm:gap-5">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative h-24 w-24 flex-none overflow-hidden rounded-card bg-sand sm:h-28 sm:w-28"
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">
            <Shopping_Cart_Empty classname="w-12 opacity-60" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Link
            href={href}
            className="home-focus line-clamp-2 rounded text-h3-md text-plum-900 hover:text-mauve-700"
          >
            {item.name}
          </Link>
          {item.variationValueName ? (
            <span className="text-caption text-lightBlack">
              {item.variationValueName}
            </span>
          ) : null}
          {item.freeShipping ? <FreeShippingBadge /> : null}
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
          <QuantityStepper
            quantity={item.numberOfProduct}
            productName={item.name}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
          />
          <div className="flex flex-col items-end gap-0.5">
            {discount > 0 ? (
              <Price
                value={item.price * item.numberOfProduct}
                strike
                className="text-caption"
              />
            ) : null}
            <Price
              value={unitPayable * item.numberOfProduct}
              className="text-h3-md font-medium text-plum-900"
            />
            {item.numberOfProduct > 1 ? (
              <span className="text-caption text-lightBlack">
                هر عدد <Price value={unitPayable} />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}
