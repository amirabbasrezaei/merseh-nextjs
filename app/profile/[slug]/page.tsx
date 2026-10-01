import Layout from "@/Components/Layout/Layout";
import Profile from "@/Components/Profile/Profile";
import { findProfileSectionBySlug } from "@/Components/Profile/sections";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = findProfileSectionBySlug(slug);
  if (!section) notFound();

  return {
    title: section.label,
    alternates: {
      canonical: `${process.env.BASE_URL}${section.href}`,
    },
  };
}

export default async function page({ params }: Props) {
  const { slug } = await params;
  const section = findProfileSectionBySlug(slug);
  if (!section) notFound();

  return (
    <Layout footer={false}>
      <Profile section={section.id} />
    </Layout>
  );
}
