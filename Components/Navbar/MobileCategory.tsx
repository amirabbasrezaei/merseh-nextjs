"use client";

import { KeyboardEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import classNames from "classnames";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import { SITE_NAME } from "@/utils/site";
import { Eyebrow } from "../Home/ui/SectionHeader";
import { Chevron_Down } from "../SVGS";
import MobileCategoryContext from "./MobileCategoryContext";

const PANEL_ID = "mcategory-panel";
const SKELETON_COUNT = 6;

function tabId(categoryId: number) {
  return `mcategory-tab-${categoryId}`;
}

function RailSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-1 py-2">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center gap-2 px-2 py-3 sm:flex-row sm:px-3"
        >
          <div className="arch aspect-[3/4] w-11 flex-none animate-pulse bg-blush-100" />
          <div className="h-3 w-14 animate-pulse rounded-full bg-blush-100/80 sm:w-24" />
        </div>
      ))}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-8">
      <div className="aspect-[16/9] animate-pulse rounded-tile bg-blush-100/70 sm:aspect-[3/1]" />
      <div className="flex flex-col gap-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-blush-100" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-20 animate-pulse rounded-full bg-blush-100/70" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MobileCategory() {
  const { data } = trpc.product.categories.useQuery();
  const categories = data?.[0]?.subCategories ?? [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const selected = categories[selectedIndex];

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!step || !categories.length) return;
    event.preventDefault();
    const next = (selectedIndex + step + categories.length) % categories.length;
    setSelectedIndex(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="flex w-full flex-col gap-6 sm:gap-8 sm:px-6">
      <div className="flex items-end justify-between gap-4 px-[5vw] sm:px-0">
        <div className="flex flex-col gap-2">
          <Eyebrow>فروشگاه {SITE_NAME}</Eyebrow>
          <h1 className="text-display-lg text-plum-900">دسته‌بندی کالاها</h1>
        </div>
        <Link
          href="/brands"
          className="home-focus flex h-10 flex-none items-center gap-2 rounded-full px-4 text-small font-medium text-plum-900 ring-1 ring-hairline transition-colors hover:bg-blush-100 hover:ring-mauve-400"
        >
          برندها
          <Chevron_Down classname="h-auto w-2.5 rotate-90 fill-mauve-700" />
        </Link>
      </div>

      <div className="flex items-start border-t border-hairline sm:gap-8 sm:border-t-0">
        <div
          role="tablist"
          aria-label="دسته‌های اصلی"
          aria-orientation="vertical"
          onKeyDown={onRailKeyDown}
          className="no-scrollbar sticky top-[var(--header-visible,0px)] max-h-[calc(100dvh-var(--header-visible,0px)-6rem)] w-[30%] flex-none self-start overflow-y-auto border-e border-hairline py-2 transition-[top] duration-300 sm:max-h-[calc(100dvh-var(--header-visible,0px)-2rem)] sm:w-60 sm:border-e-0 sm:py-0 lg:w-64"
        >
          {categories.length ? (
            <div className="flex flex-col gap-1">
              {categories.map((category, index) => {
                const active = index === selectedIndex;
                return (
                  <button
                    key={category.id}
                    ref={(element) => {
                      tabRefs.current[index] = element;
                    }}
                    id={tabId(category.id)}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-controls={PANEL_ID}
                    tabIndex={active ? 0 : -1}
                    onClick={() => setSelectedIndex(index)}
                    className={classNames(
                      "home-focus relative isolate flex w-full flex-col items-center gap-2 px-2 py-3 text-center transition-colors sm:flex-row sm:gap-3 sm:rounded-2xl sm:px-3 sm:text-start",
                      active
                        ? "text-mauve-700"
                        : "text-plum-900/75 hover:text-plum-900",
                    )}
                  >
                    {active ? (
                      <motion.span
                        aria-hidden
                        layoutId="mcategory-rail-active"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 36 }
                        }
                        className="absolute inset-0 -z-10 bg-ivory sm:rounded-2xl"
                      >
                        <span className="absolute inset-y-3 start-0 w-[3px] rounded-full bg-mauve-700" />
                      </motion.span>
                    ) : null}
                    <span className="arch relative aspect-[3/4] w-11 flex-none overflow-hidden bg-blush-100">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt=""
                          fill
                          sizes="44px"
                          className="object-cover mix-blend-multiply"
                        />
                      ) : null}
                    </span>
                    <span
                      className={classNames(
                        "text-caption leading-snug sm:text-small",
                        active && "font-semibold",
                      )}
                    >
                      {category.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <RailSkeleton />
          )}
        </div>

        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={selected ? tabId(selected.id) : undefined}
          className="min-w-0 flex-1 px-4 py-4 pe-[5vw] sm:p-0"
        >
          {selected ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              >
                <MobileCategoryContext category={selected} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <PanelSkeleton />
          )}
        </div>
      </div>
    </div>
  );
}
