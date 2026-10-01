import Link from "next/link";
import classNames from "classnames";
import { getPriceInfo } from "../utils/pricing";
import Price from "../Checkout/Price";
import QuantityStepper from "../Checkout/QuantityStepper";

type Props = {
  productName: string;
  price: number;
  discount: number;
  inStock: boolean;
  freeShipping: boolean;
  quantityInCart: number | null;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export default function ProductBuyPanel({
  productName,
  price,
  discount,
  inStock,
  freeShipping,
  quantityInCart,
  onAdd,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const { payable, percent, hasDiscount } = getPriceInfo(price, discount);

  return (
    <div className="flex flex-col gap-5 rounded-panel bg-ivory p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <Price value={price} strike className="text-small text-lightBlack" />
              <span className="rounded-full bg-mauve-700 px-2 py-0.5 text-caption font-medium text-white">
                {percent}%
              </span>
            </div>
          ) : null}
          <Price value={payable} className="text-display font-medium text-plum-900" />
        </div>
        <span
          className={classNames(
            "rounded-full bg-white px-3 py-1 text-caption font-medium",
            inStock ? "text-mauve-700" : "text-lightBlack"
          )}
        >
          {inStock ? "موجود" : "ناموجود"}
        </span>
      </div>

      <ul className="flex flex-wrap gap-2">
        <li className="rounded-full bg-white px-3 py-1 text-caption text-plum-900/80">
          ارسال با پیک و پست
        </li>
        {freeShipping ? (
          <li className="rounded-full bg-blush-100 px-3 py-1 text-caption font-medium text-mauve-700">
            ارسال رایگان
          </li>
        ) : null}
      </ul>

      {quantityInCart ? (
        <div className="flex flex-col items-center gap-3">
          <QuantityStepper
            quantity={quantityInCart}
            productName={productName}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onRemove={onRemove}
          />
          <Link
            href="/cart/checkout"
            className="home-focus text-small font-medium text-mauve-700"
          >
            مشاهده سبد خرید
          </Link>
        </div>
      ) : (
        <button
          type="button"
          disabled={!inStock}
          onClick={onAdd}
          className="home-focus home-motion inline-flex h-12 w-full items-center justify-center rounded-full bg-plum-900 px-5 text-small font-medium text-ivory hover:bg-mauve-700 disabled:cursor-not-allowed disabled:bg-mauve-400"
        >
          افزودن به سبد خرید
        </button>
      )}
    </div>
  );
}
