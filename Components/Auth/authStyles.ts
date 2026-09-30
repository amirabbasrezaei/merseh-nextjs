import classNames from "classnames";

export const authInputClass =
  "h-12 w-full appearance-none rounded-xl border border-[#E6E6E6] bg-white px-4 text-[14px] text-black1 outline-none transition-colors placeholder:text-[#B0B0B0] focus:border-green2 focus:ring-2 focus:ring-green2/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function authButtonClass(isLoading: boolean) {
  return classNames(
    "flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-[500] text-white transition-colors",
    isLoading
      ? "cursor-not-allowed bg-gray-200"
      : "cursor-pointer bg-green2 hover:bg-[#008F64]"
  );
}
