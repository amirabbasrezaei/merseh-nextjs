"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Category_Svg, Chevron_Down_sharp_light } from "@/Components/SVGS";
import splitNumber from "@/Components/utils/splitNumber";
import { getPriceInfo } from "@/Components/utils/pricing";
import { toPathSlug } from "@/utils/slug";

export type SearchCategory = { id: number; title: string; imageUrl: string };

export type SearchProduct = {
  id: number;
  name: string;
  price: number;
  discount: number;
  imageUrl: string;
};

type Props = {
  term: string;
  isSearching: boolean;
  categories: SearchCategory[];
  products: SearchProduct[];
  allResultsHref: string;
  onNavigate: () => void;
};

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};

function SearchShimmer() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-12 w-12 flex-none animate-pulse rounded-xl bg-blush-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-3 w-3/5 animate-pulse rounded-full bg-blush-100" />
            <div className="h-3 w-1/4 animate-pulse rounded-full bg-blush-100/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function GroupTitle({ children }: { children: string }) {
  return (
    <h3 className="mb-2.5 text-eyebrow text-mauve-600">{children}</h3>
  );
}

function ResultRow({
  href,
  title,
  meta,
  thumbnail,
  onNavigate,
}: {
  href: string;
  title: string;
  meta?: string;
  thumbnail: ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      onClick={onNavigate}
      href={href}
      className="home-focus group flex items-center gap-3 rounded-2xl p-1.5 transition-colors hover:bg-white/70"
    >
      <span className="relative isolate flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-ivory">
        {thumbnail}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-1 text-small text-plum-900 transition-colors group-hover:text-mauve-700">
          {title}
        </span>
        {meta ? (
          <span className="text-caption text-lightBlack">{meta}</span>
        ) : null}
      </span>
    </Link>
  );
}

export default function SearchResults({
  term,
  isSearching,
  categories,
  products,
  allResultsHref,
  onNavigate,
}: Props) {
  const reduceMotion = useReducedMotion();
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: "easeOut" } },
  };
  const isEmpty = !isSearching && !categories.length && !products.length;

  return (
    <div className="flex flex-col gap-5" aria-live="polite">
      {isSearching ? (
        <SearchShimmer />
      ) : isEmpty ? (
        <p className="py-6 text-center text-small text-lightBlack">
          نتیجه‌ای برای «{term}» پیدا نشد
        </p>
      ) : (
        <motion.div
          key={`${term}:${categories.length}:${products.length}`}
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="flex flex-col gap-5"
        >
          {products.length ? (
            <section>
              <GroupTitle>محصولات</GroupTitle>
              <ul className="flex flex-col gap-1">
                {products.map((product) => {
                  const { payable } = getPriceInfo(
                    product.price,
                    product.discount,
                  );
                  return (
                    <motion.li key={product.id} variants={itemVariants}>
                      <ResultRow
                        href={`/product/${product.id}/${toPathSlug(product.name)}`}
                        title={product.name}
                        meta={`${splitNumber(payable)} تومان`}
                        onNavigate={onNavigate}
                        thumbnail={
                          product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-contain p-1 mix-blend-multiply"
                            />
                          ) : null
                        }
                      />
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {categories.length ? (
            <section>
              <GroupTitle>دسته‌بندی‌ها</GroupTitle>
              <ul className="flex flex-col gap-1">
                {categories.map((category) => (
                  <motion.li key={category.id} variants={itemVariants}>
                    <ResultRow
                      href={`/category/${category.id}/${toPathSlug(category.title)}`}
                      title={category.title}
                      onNavigate={onNavigate}
                      thumbnail={
                        category.imageUrl ? (
                          <Image
                            src={category.imageUrl}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover mix-blend-multiply"
                          />
                        ) : (
                          <Category_Svg classname="h-auto w-5 stroke-mauve-600" />
                        )
                      }
                    />
                  </motion.li>
                ))}
              </ul>
            </section>
          ) : null}
        </motion.div>
      )}

      {term ? (
        <Link
          onClick={onNavigate}
          href={allResultsHref}
          className="home-focus group flex items-center justify-between gap-3 rounded-2xl bg-plum-900/[0.04] px-4 py-3 text-small font-medium text-plum-900 transition-colors hover:bg-blush-100 hover:text-mauve-700"
        >
          <span className="truncate">مشاهده همه نتایج «{term}»</span>
          <Chevron_Down_sharp_light classname="h-3.5 w-3.5 flex-none rotate-90 fill-current transition-transform group-hover:-translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
