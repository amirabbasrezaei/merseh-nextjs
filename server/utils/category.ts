import { prisma } from "../context";

type ParentCategories = {
  categoryId: number;
  categoryParentId?: number;
  categories?: { id: number; parentId: number | null }[];
  parents?: number[];
};

export async function parentCategories({
  categoryId,
  categories,
  categoryParentId,
  parents = [],
}: ParentCategories) {
  if (!categories) {
    let tempCategories = await prisma.category.findMany();
    let findCategory = tempCategories.find((e) => e.id === categoryId);
    if (!findCategory?.parentCategoryId) return [];
    return parentCategories({
      categoryId,
      categoryParentId: findCategory?.parentCategoryId,
      categories: tempCategories.map((e) => ({
        id: e.id,
        parentId: e.parentCategoryId,
      })),
    });
  }
  if (categoryParentId) {
    const findParent = categories.find((cat) => cat.id === categoryParentId);

    if (!findParent) {
      return parents;
    }

    if (!findParent?.parentId) {
      return [...parents, findParent.id];
    }

    return parentCategories({
      categoryId: findParent?.id,
      categories,
      parents: [...parents, findParent.id],
      categoryParentId: findParent.parentId,
    });
  }
  return [];
}

type ChildrenCategories = {
  categoryId: number;
  categories?: { id: number; parentId: number | null }[];
  childrens?: number[];
  flag?: boolean;
};

export async function childrenCategories({
  categoryId,
  categories,
  flag = true,
}: ChildrenCategories): Promise<number[]> {
  if (!categories) {
    let tempCategories = await prisma.category.findMany();
    return childrenCategories({
      categoryId,
      categories: tempCategories.map((e) => ({
        id: e.id,
        parentId: e.parentCategoryId,
      })),
    });
  }

  if (categoryId) {
    const findChildrens = categories.filter(
      (cat) => cat.parentId === categoryId
    );
    if (!findChildrens.length && !flag) {
      return [categoryId];
    }

    if (findChildrens.length) {
      const tempChildrens: number[] = [];

      for (let category of findChildrens) {
        const result = await childrenCategories({
          categoryId: category.id,
          categories,
          flag: false,
        });
        tempChildrens.push(...result);
      }
      if (flag) {
        return [...tempChildrens];
      }
      return [categoryId, ...tempChildrens];
    }
    return [];
  }
  return [];
}
