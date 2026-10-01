import classNames from "classnames";
import { TruckIcon } from "./icons";

export default function FreeShippingBadge({ className }: { className?: string }) {
  return (
    <span
      className={classNames(
        "inline-flex w-fit items-center gap-1 rounded-full bg-blush-100 px-2.5 py-1 text-caption font-medium text-mauve-700",
        className
      )}
    >
      <TruckIcon className="h-3.5 w-3.5" />
      ارسال رایگان
    </span>
  );
}
