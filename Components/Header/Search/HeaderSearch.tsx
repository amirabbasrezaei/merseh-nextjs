"use client";
import { Magnifier, XMark_Svg } from "@/Components/SVGS";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import { toPathSlug } from "@/utils/slug";
import SearchResults from "./SearchResults";

const DEBOUNCE_MS = 400;

const panelAnimation = {
  open: {
    height: "auto",
    opacity: 1,
    zIndex: 20,
  },
  hidden: {
    height: 0,
    opacity: 0,
    zIndex: 10,
  },
};

const inputClass =
  "bg-ivory border border-hairline transition-colors focus:border-mauve-400 focus:bg-white text-plum-900 placeholder:text-[15px] placeholder:text-lightBlack rounded-[10px] appearance-none outline-none";

export default function HeaderSearch() {
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [submittedTerm, setSubmittedTerm] = useState<string>("");
  const [showSearch, setShowSearch] = useState(false);
  const { data, isPending, mutate } = trpc.filter.search.useMutation();
  const { data: categoryTree } = trpc.product.categories.useQuery();

  const term = searchTerm.trim();
  const isOpen = term.length > 0;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!term) return;
    const timeout = setTimeout(() => {
      setSubmittedTerm(term);
      mutate({ text: term });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [term, mutate]);

  const root = categoryTree?.[0];
  const allResultsHref = `${
    root ? `/category/${root.id}/${toPathSlug(root.title)}` : "/category/1"
  }?searchTerm=${encodeURIComponent(term)}`;

  const close = () => {
    setSearchTerm("");
    setShowSearch(false);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape") return;
    close();
    event.currentTarget.blur();
  };

  const results = (
    <SearchResults
      term={term}
      isSearching={isPending || submittedTerm !== term}
      categories={data?.result ?? []}
      products={data?.products ?? []}
      allResultsHref={allResultsHref}
      onNavigate={close}
    />
  );

  return (
    <>
      <div className="relative hidden h-[50px] w-full max-w-[620px] items-center justify-center sm:flex">
        <div
          className={classNames(
            "relative h-full w-full",
            isOpen ? "z-30" : "z-20",
          )}
        >
          <input
            value={searchTerm}
            aria-label="جستجو در میان کالاها"
            placeholder="جستجو در میان کالاها"
            className={classNames(inputClass, "absolute h-full w-full px-5 pr-[50px]")}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Magnifier classname="pointer-events-none absolute right-[15px] top-[15px] h-auto w-[20px] fill-mauve-700" />
        </div>
        <motion.div
          initial={false}
          style={{ overflow: "hidden" }}
          variants={panelAnimation}
          animate={isOpen ? "open" : "hidden"}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong absolute top-[-15px] z-[1] w-[104%] rounded-[18px] pt-20"
        >
          <div
            style={{ scrollbarWidth: "thin" }}
            className="max-h-[min(62vh,480px)] overflow-y-auto px-5 pb-5 pt-1"
          >
            {isOpen ? results : null}
          </div>
        </motion.div>

        {isClient
          ? createPortal(
              <motion.div
                onClick={close}
                initial={false}
                animate={
                  isOpen
                    ? { opacity: 1, backdropFilter: "blur(2px)", scale: 1 }
                    : { opacity: 0, backdropFilter: "blur(0px)", scale: 0 }
                }
                className="fixed z-10 h-full w-full"
              />,
              document.body,
            )
          : null}
      </div>

      <button
        type="button"
        onClick={() => setShowSearch(true)}
        className="home-focus flex h-10 w-full items-center gap-2.5 rounded-full border border-hairline bg-ivory px-4 text-small text-lightBlack sm:hidden"
      >
        <Magnifier classname="h-auto w-[18px] flex-none fill-mauve-700" />
        جستجو در میان کالاها
      </button>

      {isClient
        ? createPortal(
            <AnimatePresence>
              {showSearch ? (
                <motion.div
                  key="mobile-search"
                  dir="rtl"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="fixed inset-0 z-50 flex flex-col bg-white"
                >
                  <div className="flex items-center gap-3 border-b border-hairline px-[5vw] py-3">
                    <div className="relative flex-1">
                      <input
                        value={searchTerm}
                        aria-label="جستجو در میان کالاها"
                        placeholder="جستجو در میان کالاها"
                        autoFocus
                        className={classNames(inputClass, "h-12 w-full pl-4 pr-11")}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={onKeyDown}
                      />
                      <Magnifier classname="pointer-events-none absolute right-4 top-1/2 h-auto w-[18px] -translate-y-1/2 fill-mauve-700" />
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="home-focus flex h-12 flex-none items-center gap-1.5 rounded-[10px] bg-blush-100 px-3 text-small font-medium text-plum-900"
                    >
                      <XMark_Svg classname="h-auto w-3.5 fill-mauve-700" />
                      بستن
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-[5vw] py-5">
                    {isOpen ? results : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
