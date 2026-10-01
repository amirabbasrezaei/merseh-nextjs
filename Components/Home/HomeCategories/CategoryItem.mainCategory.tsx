import Image from "next/image";
import Link from "next/link";

interface Props {
  id: number;
  title: string;
  image_url: string;
}

export const categoryTileWidthClass =
  "w-[38vw] shrink-0 snap-start sm:w-48 lg:w-auto";

export default function CategoryItem({ id, image_url, title }: Props) {
  return (
    <Link
      href={`/category/${id}/${title.replaceAll(" ", "-")}`}
      className={`home-focus group flex flex-col items-center gap-4 ${categoryTileWidthClass}`}
    >
      <div className="arch home-motion relative isolate aspect-[3/4] w-full overflow-hidden bg-blush-100 group-hover:bg-blush-200">
        <Image
          src={image_url}
          alt=""
          fill
          sizes="(max-width: 639px) 38vw, (max-width: 1023px) 192px, 230px"
          className="home-zoom object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <span
          aria-hidden
          className="home-motion absolute inset-0 bg-gradient-to-t from-plum-900/15 via-transparent to-transparent opacity-0 group-hover:opacity-100"
        />
      </div>
      <h3 className="home-motion line-clamp-1 text-center text-h3 text-plum-900 group-hover:text-mauve-700 md:text-h3-md">
        {title}
      </h3>
    </Link>
  );
}
