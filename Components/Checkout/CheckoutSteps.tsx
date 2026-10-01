import classNames from "classnames";
import Link from "next/link";
import { CheckIcon } from "./icons";

const STEPS = [
  { id: "cart", label: "سبد خرید", href: "/cart/checkout" },
  { id: "shipping", label: "آدرس و ارسال", href: "/cart/shipping" },
  { id: "payment", label: "پرداخت", href: null },
] as const;

export type CheckoutStep = (typeof STEPS)[number]["id"];

export default function CheckoutSteps({ current }: { current: CheckoutStep }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="مراحل خرید" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const marker = (
            <>
              <span
                className={classNames(
                  "flex h-7 w-7 flex-none items-center justify-center rounded-full text-caption font-medium sm:h-8 sm:w-8",
                  isDone && "bg-mauve-700 text-white",
                  isCurrent && "bg-plum-900 text-white",
                  !isDone && !isCurrent && "border border-hairline bg-white text-lightBlack"
                )}
              >
                {isDone ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={classNames(
                  "whitespace-nowrap text-caption sm:text-small",
                  isCurrent ? "font-medium text-plum-900" : "text-lightBlack"
                )}
              >
                {step.label}
              </span>
            </>
          );

          return (
            <li
              key={step.id}
              className="flex flex-1 items-center gap-2 last:flex-none sm:gap-3"
            >
              {isDone && step.href ? (
                <Link
                  href={step.href}
                  className="home-focus flex items-center gap-2 rounded-full"
                >
                  {marker}
                </Link>
              ) : (
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className="flex items-center gap-2"
                >
                  {marker}
                </span>
              )}
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={classNames(
                    "h-px min-w-3 flex-1",
                    isDone ? "bg-mauve-400" : "bg-hairline"
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
