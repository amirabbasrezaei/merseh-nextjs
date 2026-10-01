import classNames from "classnames";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-mauve-700 text-white hover:bg-plum-900 disabled:bg-mauve-400 disabled:cursor-not-allowed",
  secondary:
    "border border-hairline bg-white text-plum-900 hover:border-mauve-400 hover:bg-blush-100",
  quiet: "text-mauve-700 hover:bg-blush-100",
};

export function buttonClass(variant: ButtonVariant, className?: string) {
  return classNames(
    "home-focus home-motion inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-small font-medium",
    BUTTON_VARIANTS[variant],
    className,
  );
}

export function ProfileCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        "rounded-tile border border-hairline bg-white p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  description,
  action,
  as: Heading = "h2",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1">
        <Heading className="text-h2 text-plum-900 md:text-h2-md">{title}</Heading>
        {description ? (
          <p className="text-small text-lightBlack">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-tile border border-dashed border-hairline bg-ivory px-6 py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-100 text-mauve-700">
        {icon}
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="text-h3-md text-plum-900">{title}</p>
        {description ? (
          <p className="text-small text-lightBlack">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={classNames("block animate-pulse rounded-card bg-sand", className)}
    />
  );
}
