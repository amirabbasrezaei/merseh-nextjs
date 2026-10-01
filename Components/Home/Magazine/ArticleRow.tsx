import Image from "next/image";
import Link from "next/link";
import { articlePath, formatArticleDate, type HomeArticle } from "./articleMeta";

export default function ArticleRow({ article }: { article: HomeArticle }) {
  const image = article.images?.[0];
  const date = formatArticleDate(article.created_at);

  return (
    <Link
      href={articlePath(article)}
      className="home-focus group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-hairline py-6 first:pt-0 last:border-b-0 last:pb-0 md:gap-6"
    >
      <div className="flex min-w-0 flex-col gap-2">
        {date ? (
          <time className="text-caption text-mauve-600">{date}</time>
        ) : null}
        <h3 className="home-motion line-clamp-2 text-h3 font-medium text-plum-900 group-hover:text-mauve-700 md:text-h3-md">
          {article.title}
        </h3>
      </div>
      <div className="relative h-24 w-32 overflow-hidden rounded-card bg-blush-100 md:h-28 md:w-40">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="160px"
            className="home-zoom object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : null}
      </div>
    </Link>
  );
}
