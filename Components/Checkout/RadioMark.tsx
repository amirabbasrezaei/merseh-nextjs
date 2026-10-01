import classNames from "classnames";

export default function RadioMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={classNames(
        "home-motion flex h-5 w-5 flex-none items-center justify-center rounded-full border-2",
        checked ? "border-mauve-700" : "border-hairline bg-white"
      )}
    >
      <span
        className={classNames(
          "home-motion h-2.5 w-2.5 rounded-full bg-mauve-700",
          checked ? "scale-100 opacity-100" : "scale-50 opacity-0"
        )}
      />
    </span>
  );
}

export const choiceCardClass = (checked: boolean, disabled = false) =>
  classNames(
    "home-motion relative flex gap-3 rounded-tile border bg-white p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mauve-700 sm:p-5",
    checked ? "border-mauve-600 shadow-card ring-4 ring-blush-100" : "border-hairline",
    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
    !checked && !disabled && "hover:border-mauve-400/60"
  );
