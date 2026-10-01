import Image from "next/image";
import Link from "next/link";
import { Chevron_Down_sharp_light } from "../../SVGS";
import {
  articleExcerpt,
  articlePath,
  formatArticleDate,
  type HomeArticle,
} from "./articleMeta";

export default function FeaturedArticle({ article }: { article: HomeArticle }) {
  const image = article.images?.[0];
  const excerpt = articleExcerpt(article.content);
  const date = formatArticleDate(article.created_at);

  return (
    <Link
      href={articlePath(article)}
      className="home-focus group flex flex-col gap-6 rounded-panel"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-panel bg-blush-100">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 1023px) 92vw, 760px"
            className="home-zoom object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        {date ? (
          <time
            className="text-caption text-mauve-600"
            dateTime={new Date(article.created_at).toISOString()}
          >
            {date}
          </time>
        ) : null}
        <h3 className="home-motion text-display text-plum-900 group-hover:text-mauve-700 md:text-display-md">
          {article.title}
        </h3>
        {excerpt ? (
          <p className="line-clamp-2 max-w-2xl text-body text-black1/75">
            {excerpt}
          </p>
        ) : null}
        <span className="mt-1 inline-flex items-center gap-1.5 text-small font-medium text-plum-900">
          ادامه مطلب
          <Chevron_Down_sharp_light classname="home-motion h-4 w-4 rotate-90 fill-current group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
