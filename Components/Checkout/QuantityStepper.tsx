import { Minus_Svg, Plus_Svg } from "../SVGS";
import { TrashIcon } from "./icons";

type Props = {
  quantity: number;
  productName: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

const stepButton =
  "home-focus home-motion flex h-9 w-9 items-center justify-center rounded-full text-mauve-700 hover:bg-blush-100";

export default function QuantityStepper({
  quantity,
  productName,
  onIncrement,
  onDecrement,
  onRemove,
}: Props) {
  const isLast = quantity <= 1;

  return (
    <div
      role="group"
      aria-label={`تعداد ${productName}`}
      className="inline-flex items-center gap-1 rounded-full border border-hairline bg-white p-0.5"
    >
      <button
        type="button"
        onClick={onIncrement}
        aria-label="افزایش تعداد"
        className={stepButton}
      >
        <Plus_Svg classname="h-3.5 w-3.5 fill-current" />
      </button>
      <span
        aria-live="polite"
        className="min-w-7 text-center text-small font-medium text-plum-900"
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={isLast ? onRemove : onDecrement}
        aria-label={isLast ? "حذف از سبد" : "کاهش تعداد"}
        className={stepButton}
      >
        {isLast ? (
          <TrashIcon className="h-4 w-4" />
        ) : (
          <Minus_Svg classname="h-3.5 w-3.5 fill-current" />
        )}
      </button>
    </div>
  );
}
