import ArticleEdit from "@/Components/Admin/Article/ArticleEdit";
import React from "react";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function page({ params }: Props) {
  const { slug } = await params;
  return <ArticleEdit articleId={slug} />;
}
