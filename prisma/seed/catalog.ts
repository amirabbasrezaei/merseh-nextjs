import { richContent } from "./content";
import { categories } from "./data/categories";
import { IMAGES } from "./data/images";
import { products } from "./data/products";
import { uploadImageFromUrl } from "./media";
import type { CatalogResult, SeedPrisma } from "./types";

function parentChain(
  slug: string,
  bySlug: Map<string, { id: number; parentSlug: string | null }>
): number[] {
  const ids: number[] = [];
  let current = bySlug.get(slug);
  while (current?.parentSlug) {
    const parent = bySlug.get(current.parentSlug);
    if (!parent) break;
    ids.push(parent.id);
    current = parent;
  }
  return ids;
}

export async function seedCatalog(prisma: SeedPrisma): Promise<CatalogResult> {
  const categoryMeta = new Map<
    string,
    { id: number; parentSlug: string | null }
  >();
  const categoriesBySlug = new Map<string, number>();

  for (const category of categories) {
    const image = await uploadImageFromUrl(
      prisma,
      IMAGES[category.imageKey],
      "category",
      `${category.slug}.jpg`
    );

    const parentId = category.parentSlug
      ? categoriesBySlug.get(category.parentSlug)
      : undefined;

    if (category.parentSlug && parentId === undefined) {
      throw new Error(`Missing parent category ${category.parentSlug}`);
    }

    const created = await prisma.category.create({
      data: {
        title: category.title,
        englishTitle: category.englishTitle,
        metaDescription: category.metaDescription,
        content: richContent(
          category.paragraphs.map((paragraph) => ({ paragraphs: [paragraph] }))
        ),
        status: "ENABLED",
        parentCategoryId: parentId ?? null,
        imageFileId: image.id,
      },
    });

    categoriesBySlug.set(category.slug, created.id);
    categoryMeta.set(category.slug, {
      id: created.id,
      parentSlug: category.parentSlug,
    });
  }

  console.log(`Seeded ${categories.length} categories`);

  const productsByEngName: CatalogResult["productsByEngName"] = new Map();

  for (const product of products) {
    const leafId = categoriesBySlug.get(product.leafSlug);
    if (leafId === undefined) {
      throw new Error(`Missing leaf category ${product.leafSlug}`);
    }

    const ancestorIds = parentChain(product.leafSlug, categoryMeta);
    const categoryIds = [...new Set([leafId, ...ancestorIds])];

    const gallery = [];
    for (const [index, imageKey] of product.imageKeys.entries()) {
      const file = await uploadImageFromUrl(
        prisma,
        IMAGES[imageKey],
        "product/gallery",
        `${product.engName.replaceAll(" ", "-")}-${index + 1}.jpg`
      );
      gallery.push({ fileId: file.id, sortOrder: index });
    }

    const created = await prisma.product.create({
      data: {
        name: product.name,
        engName: product.engName,
        price: product.price,
        discount: product.discount ?? 0,
        quantity: product.quantity ?? 10,
        status: product.status ?? "PUBLISHED",
        mainCategoryId: leafId,
        metaDescription: product.metaDescription,
        content_keywords: product.keywords,
        details: product.details,
        content: richContent(product.sections),
        category: {
          connect: categoryIds.map((id) => ({ id })),
        },
        galleryFiles: {
          create: gallery,
        },
        ProductVariation: product.variation
          ? {
              create: {
                variateName: product.variation.variateName,
                values: {
                  create: product.variation.values.map((value) => ({
                    name: value.name,
                    price: value.price,
                    discount: value.discount ?? 0,
                    quantity: value.quantity ?? 10,
                  })),
                },
              },
            }
          : undefined,
      },
      include: {
        ProductVariation: {
          include: { values: true },
        },
      },
    });

    const variation = created.ProductVariation[0];
    const firstValue = variation?.values[0];

    productsByEngName.set(product.engName, {
      id: created.id,
      variation:
        variation && firstValue
          ? { id: variation.id, valueId: firstValue.id }
          : undefined,
    });
  }

  console.log(`Seeded ${products.length} products`);

  return { productsByEngName, categoriesBySlug };
}
