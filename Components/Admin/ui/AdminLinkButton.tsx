import React from "react";
import classNames from "classnames";
import Link from "next/link";

type Props = React.ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};

const variantClass = {
  primary: "bg-green2 text-white hover:bg-green1 border border-transparent",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent",
};

const sizeClass = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
};

export default function AdminLinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Props) {
  return (
    <Link
      className={classNames(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
