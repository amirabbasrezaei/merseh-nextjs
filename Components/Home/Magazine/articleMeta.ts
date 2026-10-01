export type HomeArticle = {
  id: number;
  title: string;
  englishTitle: string;
  created_at: string | Date;
  content: string;
  images?: string[] | null;
};

export function articlePath(article: Pick<HomeArticle, "id" | "title" | "englishTitle">) {
  const slug = (article.englishTitle || article.title).replaceAll(" ", "-");
  return `/mag/${article.id}/${slug}`;
}

export function formatArticleDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function articleExcerpt(content: string) {
  return content.replace(/\s*\.\.\.$/, "").trim();
}
