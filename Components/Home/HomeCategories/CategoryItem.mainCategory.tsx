import Image from "next/image";
import Link from "next/link";

interface Props {
  id: number;
  title: string;
  image_url: string;
}

export default function CategoryItem({ id, image_url, title }: Props) {
  return (
    <Link
      href={`/category/${id}/${title.replaceAll(" ", "-")}`}
      className="home-enter home-focus w-[120px] shrink-0 snap-start md:w-[160px]"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-tile">
        <Image
          src={image_url}
          alt=""
          fill
          quality={75}
          sizes="160px"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-3 pt-10">
          <h3 className="line-clamp-2 text-center text-small text-white">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}
