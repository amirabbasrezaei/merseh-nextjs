import { toPathSlug } from "@/utils/slug";

export interface categoryType {
  id: number;
  title: string;
  parentCategoryId: number | null;
  subCategories?: any[] | undefined;
  insertedIntoParent?: boolean | undefined;
  englishTitle: string;
  content: any;
  metaDescription: string;
  imageUrl?: string;
}

export type CategoryNode = {
  id: number;
  title: string;
  imageUrl?: string;
  subCategories?: CategoryNode[];
};

export function categoryHref(category: Pick<CategoryNode, "id" | "title">) {
  return `/category/${category.id}/${toPathSlug(category.title)}`;
}

/** Returns the chain of nodes from the tree root down to `id`, or an empty array when it isn't found. */
export function findCategoryPath(
  nodes: CategoryNode[] | undefined,
  id: number,
): CategoryNode[] {
  for (const node of nodes ?? []) {
    if (node.id === id) return [node];
    const path = findCategoryPath(node.subCategories, id);
    if (path.length) return [node, ...path];
  }
  return [];
}
