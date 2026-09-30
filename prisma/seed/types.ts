import type { PrismaClient } from "../../generated/prisma/client";

export type SeedPrisma = PrismaClient;

export type ContentNode = {
  type: string;
  content:
    | string
    | {
        src?: string;
        name?: string;
        format?: string;
        fileId?: string;
      };
  childs?: ContentNode[] | null;
};

export type SeedCategory = {
  slug: string;
  title: string;
  englishTitle: string;
  parentSlug: string | null;
  metaDescription: string;
  paragraphs: string[];
  imageKey: string;
};

export type SeedVariationValue = {
  name: string;
  price: number;
  discount?: number;
  quantity?: number;
};

export type SeedProduct = {
  name: string;
  engName: string;
  price: number;
  discount?: number;
  quantity?: number;
  status?: "PUBLISHED" | "DRAFT";
  leafSlug: string;
  metaDescription: string;
  keywords: string[];
  details: string[];
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    list?: string[];
  }>;
  imageKeys: [string, string];
  variation?: {
    variateName: string;
    values: SeedVariationValue[];
  };
};

export type SeedArticle = {
  title: string;
  englishTitle: string;
  metaDescription: string;
  keywords: string[];
  isSuggested?: boolean;
  status?: "PUBLISHED" | "DRAFT";
  createdAt: Date;
  imageKeys: string[];
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    list?: string[];
  }>;
};

export type CatalogResult = {
  productsByEngName: Map<
    string,
    {
      id: number;
      variation?: { id: number; valueId: number };
    }
  >;
  categoriesBySlug: Map<string, number>;
};

export type EditorialResult = {
  articlesByEnglishTitle: Map<string, number>;
  shippingByName: Map<string, string>;
};
