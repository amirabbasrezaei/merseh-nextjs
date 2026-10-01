import classNames from "classnames";
import { brandWordmark } from "@/app/fonts";
import { SITE_NAME } from "@/utils/site";

type Props = {
  className?: string;
};

export default function BrandWordmark({ className }: Props) {
  return (
    <span
      dir="ltr"
      lang="en"
      className={classNames(
        brandWordmark.className,
        "inline-block whitespace-nowrap font-medium italic leading-none tracking-[0.14em]",
        className,
      )}
    >
      {SITE_NAME}
    </span>
  );
}
