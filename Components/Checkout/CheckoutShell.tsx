import Link from "next/link";
import type { ReactNode } from "react";
import CheckoutSteps, { type CheckoutStep } from "./CheckoutSteps";
import { ArrowIcon } from "./icons";

type Props = {
  step: CheckoutStep;
  title: string;
  meta?: ReactNode;
  back?: { href: string; label: string };
  children: ReactNode;
};

export default function CheckoutShell({ step, title, meta, back, children }: Props) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:px-5 lg:gap-8">
      <div className="flex flex-col gap-5 rounded-tile bg-ivory p-4 sm:p-6">
        <CheckoutSteps current={step} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            {back ? (
              <Link
                href={back.href}
                className="home-focus inline-flex w-fit items-center gap-1.5 rounded-full text-caption text-mauve-700 hover:text-plum-900"
              >
                <ArrowIcon className="h-3.5 w-3.5" />
                {back.label}
              </Link>
            ) : null}
            <h1 className="text-h2 text-plum-900 md:text-h2-md">{title}</h1>
          </div>
          {meta ? <div className="text-small text-lightBlack">{meta}</div> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
