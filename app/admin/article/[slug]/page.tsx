import ArticleEdit from '@/Components/Admin/Article/ArticleEdit';
import React from 'react'

interface Props {
    params: { slug: string };
  }

export default function page({params}: Props) {
  return (
    <ArticleEdit articleId={params.slug} />
  )
}
