import Image from "next/image";
import Link from "next/link";
import { Chevron_Down } from "../SVGS";
import { categoryHref, type CategoryNode } from "../Products/categoryTree";

type Props = {
  category: CategoryNode;
};

function Chevron({ className }: { className: string }) {
  return <Chevron_Down classname={`h-auto w-2.5 rotate-90 fill-current ${className}`} />;
}

function ChipList({ items }: { items: CategoryNode[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={categoryHref(item)}
            className="home-focus flex h-9 items-center rounded-full bg-white px-3.5 text-caption text-plum-900/85 ring-1 ring-hairline transition-colors hover:bg-blush-100 hover:text-plum-900 hover:ring-mauve-400 sm:text-small"
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function MobileCategoryContext({ category }: Props) {
  const children = category.subCategories ?? [];
  const leaves = children.filter((child) => !child.subCategories?.length);
  const groups = children.filter((child) => child.subCategories?.length);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href={categoryHref(category)}
        className="home-focus group relative isolate block aspect-[16/9] overflow-hidden rounded-tile bg-blush-100 sm:aspect-[3/1]"
      >
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt=""
            fill
            sizes="(max-width: 639px) 65vw, 900px"
            className="-z-10 object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-blush-100 via-ivory to-blush-100"
          />
        )}
        <span className="glass absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-3 rounded-2xl px-4 py-2 sm:inset-x-4 sm:bottom-4 sm:w-fit sm:min-w-[260px] sm:rounded-full sm:py-2.5">
          <span className="flex min-w-0 flex-col">
            <span className="text-caption text-plum-900/70">همه محصولات</span>
            <span className="truncate text-small font-semibold text-plum-900">
              {category.title}
            </span>
          </span>
          <Chevron className="flex-none text-mauve-700 transition-transform group-hover:-translate-x-0.5" />
        </span>
      </Link>

      {leaves.length ? <ChipList items={leaves} /> : null}

      {groups.length ? (
        <ul className="columns-1 gap-10 sm:columns-2 xl:columns-3">
          {groups.map((group) => (
            <li key={group.id} className="mb-7 flex break-inside-avoid flex-col gap-3">
              <Link
                href={categoryHref(group)}
                className="home-focus group flex w-fit items-center gap-2 rounded text-h3-md text-plum-900 transition-colors hover:text-mauve-700"
              >
                {group.title}
                <Chevron className="text-mauve-400 transition-transform group-hover:-translate-x-0.5" />
              </Link>
              <ChipList items={group.subCategories ?? []} />
            </li>
          ))}
        </ul>
      ) : null}

      {children.length ? null : (
        <p className="text-small text-lightBlack">
          همه کالاهای این دسته را از کارت بالا ببینید.
        </p>
      )}
    </div>
  );
}
