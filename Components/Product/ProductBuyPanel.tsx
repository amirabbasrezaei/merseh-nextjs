import Link from "next/link";
import Button from "../Button";
import splitNumber from "../utils/splitNumber";
import { Minus_Svg, Plus_Svg, TrashBin_SVG } from "../SVGS";

type Props = {
  price: number;
  discount: number;
  inStock: boolean;
  quantityInCart: number | null;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

export default function ProductBuyPanel({
  price,
  discount,
  inStock,
  quantityInCart,
  onAdd,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const payable = Math.max(price - discount, 0);
  const percent = price > 0 ? Math.round((discount / price) * 100) : 0;
  const showDiscount = discount > 0 && price > 0;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#EAEAEA] p-5">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col">
          {showDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-lightBlack line-through">
                {splitNumber(price)}
              </span>
              <span className="rounded-[10px] bg-green1 px-1.5 py-0.5 text-[13px] font-light text-white">
                {percent}%
              </span>
            </div>
          ) : null}
          <div className="flex items-baseline gap-1">
            <span className="text-[30px] font-medium text-[#3c3c3c]">
              {splitNumber(payable)}
            </span>
            <span className="text-[13px] text-black1">تومان</span>
          </div>
        </div>
        <span
          className={
            inStock ? "text-[14px] text-green2" : "text-[14px] text-lightBlack"
          }
        >
          {inStock ? "موجود" : "ناموجود"}
        </span>
      </div>

      {quantityInCart ? (
        <div className="flex w-full flex-row items-center justify-evenly rounded-[8px] bg-gray-50 py-2">
          <button type="button" aria-label="افزایش" onClick={onIncrement}>
            <Plus_Svg classname="w-6 fill-green2" />
          </button>
          <span className="text-[23px]">{quantityInCart}</span>
          <button
            type="button"
            aria-label={quantityInCart > 1 ? "کاهش" : "حذف"}
            onClick={quantityInCart > 1 ? onDecrement : onRemove}
          >
            {quantityInCart > 1 ? (
              <Minus_Svg classname="w-6 fill-green2" />
            ) : (
              <TrashBin_SVG classname="stroke-red-600 w-6" />
            )}
          </button>
        </div>
      ) : (
        <Button
          text="افزودن به سبد خرید"
          className="w-full"
          isDisabled={!inStock}
          onClick={onAdd}
        />
      )}

      {quantityInCart ? (
        <Link href="/cart/checkout" className="text-center text-green2">
          مشاهده سبد خرید
        </Link>
      ) : null}

      <p className="text-center text-[13px] text-lightBlack">ارسال با پیک و پست</p>
    </div>
  );
}
