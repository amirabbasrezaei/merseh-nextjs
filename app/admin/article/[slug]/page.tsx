import ArticleEdit from "@/Components/Admin/Article/ArticleEdit";
import Layout from "@/Components/Layout/Layout";
import React from "react";

interface Props {
  params: { slug: string };
}

export default function page({ params }: Props) {
  return (
    <Layout footer={false} header={false}>
      <ArticleEdit articleId={params.slug} />
    </Layout>
  );
}
