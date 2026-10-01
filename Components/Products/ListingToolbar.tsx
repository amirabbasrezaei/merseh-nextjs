"use client";

import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import classNames from "classnames";
import { Magnifier, XMark_Svg } from "../SVGS";
import GlassThumb from "../ui/GlassThumb";
import { DEFAULT_SORT, SORT_OPTIONS, type SortValue } from "./sortProducts";

const SEARCH_DEBOUNCE_MS = 350;

type Props = {
  searchTerm: string;
  sort: SortValue;
};

function useIsStuck(ref: RefObject<HTMLElement | null>) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const element = ref.current;
    const scroller = element?.closest("main");
    if (!element || !scroller) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const style = getComputedStyle(element);
      if (style.position !== "sticky") {
        setStuck(false);
        return;
      }
      const offset =
        element.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top;
      setStuck(offset <= parseFloat(style.top) + 1);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return stuck;
}

export default function ListingToolbar({ searchTerm, sort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const ref = useRef<HTMLDivElement>(null);
  const stuck = useIsStuck(ref);
  const [draft, setDraft] = useState(searchTerm);

  const replaceParam = useCallback(
    (name: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(name, value);
      else next.delete(name);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  useEffect(() => {
    setDraft(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const next = draft.trim();
    if (next === searchTerm) return;
    const timeout = setTimeout(
      () => replaceParam("searchTerm", next),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [draft, searchTerm, replaceParam]);

  return (
    <div
      ref={ref}
      className={classNames(
        "z-20 flex flex-col gap-3 rounded-[22px] border p-2 transition-[top,background-color,border-color,box-shadow] duration-300 md:sticky md:top-[calc(var(--header-visible,0px)+0.75rem)] md:flex-row md:items-center md:justify-between",
        stuck ? "glass" : "border-hairline bg-white",
      )}
    >
      <label className="relative flex h-11 items-center md:w-80">
        <span className="sr-only">جستجو در این دسته‌بندی</span>
        <Magnifier classname="pointer-events-none absolute start-4 h-auto w-[17px] fill-mauve-700" />
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="جستجو در این دسته‌بندی"
          className="h-full w-full appearance-none rounded-full bg-ivory pe-10 ps-11 text-small text-plum-900 outline-none ring-1 ring-transparent transition placeholder:text-lightBlack focus:bg-white focus:ring-mauve-400"
        />
        {draft ? (
          <button
            type="button"
            aria-label="پاک کردن جستجو"
            onClick={() => setDraft("")}
            className="home-focus absolute end-2 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-blush-100"
          >
            <XMark_Svg classname="h-auto w-2.5 fill-mauve-700" />
          </button>
        ) : null}
      </label>

      <div
        role="radiogroup"
        aria-label="مرتب‌سازی"
        className="no-scrollbar flex items-center gap-1 overflow-x-auto rounded-full bg-plum-900/[0.04] p-1"
      >
        {SORT_OPTIONS.map((option) => {
          const active = option.value === sort;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() =>
                replaceParam(
                  "sort",
                  option.value === DEFAULT_SORT ? "" : option.value,
                )
              }
              className={classNames(
                "home-focus relative isolate h-9 flex-1 whitespace-nowrap rounded-full px-3 text-caption transition-colors sm:px-4 sm:text-small md:flex-none",
                active
                  ? "font-semibold text-plum-900"
                  : "text-lightBlack hover:text-plum-900",
              )}
            >
              {active ? <GlassThumb layoutId="listing-sort-thumb" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
