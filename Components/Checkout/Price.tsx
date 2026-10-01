import classNames from "classnames";
import splitNumber from "../utils/splitNumber";

type Props = {
  value: number;
  className?: string;
  strike?: boolean;
};

export default function Price({ value, className, strike = false }: Props) {
  return (
    <span
      className={classNames(
        "inline-flex items-baseline gap-1 whitespace-nowrap",
        strike && "text-lightBlack line-through decoration-1",
        className
      )}
    >
      {splitNumber(value)}
      <span className="text-caption font-normal text-lightBlack">تومان</span>
    </span>
  );
}
