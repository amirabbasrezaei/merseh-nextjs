import Image from "next/image";
import Link from "next/link";
import { Chevron_Down_sharp_light } from "../SVGS";
import { Eyebrow } from "../Home/ui/SectionHeader";
import { categoryHref, type CategoryNode } from "./categoryTree";

type Props = {
  title: string;
  imageUrl?: string;
  path: CategoryNode[];
  count: number | null;
};

function Separator() {
  return (
    <Chevron_Down_sharp_light classname="h-2.5 w-2.5 rotate-90 fill-mauve-400" />
  );
}

export default function CategoryHero({ title, imageUrl, path, count }: Props) {
  const ancestors = path.slice(0, -1);

  return (
    <header className="flex flex-col gap-5">
      <nav aria-label="مسیر صفحه">
        <ol className="flex flex-wrap items-center gap-2 text-caption text-lightBlack">
          <li className="flex items-center gap-2">
            <Link href="/" className="home-focus rounded transition-colors hover:text-mauve-700">
              خانه
            </Link>
            <Separator />
          </li>
          {ancestors.map((category) => (
            <li key={category.id} className="flex items-center gap-2">
              <Link
                href={categoryHref(category)}
                className="home-focus rounded transition-colors hover:text-mauve-700"
              >
                {category.title}
              </Link>
              <Separator />
            </li>
          ))}
          <li aria-current="page" className="font-medium text-plum-900">
            {title}
          </li>
        </ol>
      </nav>

      <div className="relative isolate flex items-center justify-between gap-6 overflow-hidden rounded-panel bg-ivory px-6 py-7 sm:px-10 sm:py-10">
        <span
          aria-hidden
          className="absolute -end-16 -top-24 -z-10 h-64 w-64 rounded-full bg-blush-100/80 blur-3xl"
        />
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="flex flex-col gap-3">
            <Eyebrow>قیمت و خرید</Eyebrow>{" "}
            <span className="text-display-lg text-plum-900">{title}</span>
          </h1>
          {count === null ? (
            <span aria-hidden className="h-4 w-16 animate-pulse rounded-full bg-blush-100" />
          ) : (
            <p className="text-small text-lightBlack">{count} کالا</p>
          )}
        </div>
        {imageUrl ? (
          <div className="arch relative isolate aspect-[3/4] w-20 flex-none overflow-hidden bg-blush-100 sm:w-28">
            <Image
              src={imageUrl}
              alt=""
              fill
              priority
              sizes="112px"
              className="object-cover mix-blend-multiply"
            />
          </div>
        ) : null}
      </div>
    </header>
  );
}
