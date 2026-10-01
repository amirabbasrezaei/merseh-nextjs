import Link from "next/link";
import classNames from "classnames";
import { categoryHref, type CategoryNode } from "./categoryTree";

type Props = {
  parent: CategoryNode;
  items: CategoryNode[];
  activeId: number;
};

function Chip({
  category,
  label,
  active,
}: {
  category: CategoryNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={categoryHref(category)}
      aria-current={active ? "page" : undefined}
      className={classNames(
        "home-focus flex h-10 items-center whitespace-nowrap rounded-full px-4 text-small ring-1 transition-colors",
        active
          ? "bg-plum-900 font-medium text-ivory ring-plum-900"
          : "bg-white text-plum-900 ring-hairline hover:bg-blush-100 hover:ring-mauve-400",
      )}
    >
      {label}
    </Link>
  );
}

export default function SubcategoryChips({ parent, items, activeId }: Props) {
  return (
    <nav aria-label="زیردسته‌ها" className="-mx-[5vw] sm:mx-0">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-[5vw] py-0.5 sm:flex-wrap sm:overflow-visible sm:px-0">
        <li className="flex-none">
          <Chip category={parent} label="همه" active={parent.id === activeId} />
        </li>
        {items.map((item) => (
          <li key={item.id} className="flex-none">
            <Chip category={item} label={item.title} active={item.id === activeId} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
