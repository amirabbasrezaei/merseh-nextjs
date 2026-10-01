import { articles } from "./data/articles";
import { IMAGES } from "./data/images";
import { richContent } from "./content";
import { fetchMohanaHomeBanners } from "./mohana";
import { uploadImageFromUrl } from "./media";
import type { CatalogResult, EditorialResult, SeedPrisma } from "./types";

function categoryHref(catalog: CatalogResult, slugPart: string) {
  const match = [...catalog.categoriesBySlug.entries()].find(([slug]) =>
    slug.includes(slugPart)
  );
  if (!match) return null;
  return `/category/${match[1]}/${match[0]}`;
}

function localBannerHref(remoteHref: string, catalog: CatalogResult) {
  let decoded = remoteHref;
  try {
    decoded = decodeURIComponent(remoteHref);
  } catch {
    decoded = remoteHref;
  }

  const rules: Array<[RegExp, string]> = [
    [/محصولات-مو|(?:^|\/)مو(?:\/|$)/u, "محصولات-مو"],
    [/محصولات-پوست|glass-skin|anua|medicube|ordinary|rhode/i, "محصولات-پوست"],
    [/لوازم-آرایشی|sheglam|cosrx|e-l-f|elf/i, "لوازم-آرایشی"],
    [/محصولات-بدن/, "محصولات-بدن"],
  ];

  for (const [pattern, slugPart] of rules) {
    if (!pattern.test(decoded)) continue;
    const href = categoryHref(catalog, slugPart);
    if (href) return href;
  }

  return categoryHref(catalog, "لوازم-آرایشی") ?? "/";
}

export async function seedEditorial(
  prisma: SeedPrisma,
  catalog: CatalogResult
): Promise<EditorialResult> {
  if (!catalog.categoriesBySlug.size || !catalog.productsByEngName.size) {
    throw new Error("Catalog is missing categories or products for banners");
  }

  const homeBanners = await fetchMohanaHomeBanners();
  const sortByPlacement = { HERO: 0, SIDE: 0 };

  for (const banner of homeBanners) {
    const image = await uploadImageFromUrl(
      prisma,
      banner.imageUrl,
      "banner",
      banner.imageUrl.split("/").pop() || "banner.jpg"
    );
    const sortOrder = sortByPlacement[banner.placement];
    sortByPlacement[banner.placement] += 1;
    await prisma.banner.create({
      data: {
        placement: banner.placement,
        title: null,
        href: localBannerHref(banner.remoteHref, catalog),
        sortOrder,
        isActive: true,
        imageFileId: image.id,
      },
    });
  }

  console.log(`Seeded ${homeBanners.length} Mohana banners`);

  const articlesByEnglishTitle = new Map<string, number>();

  for (const article of articles) {
    const gallery = [];
    for (const [index, imageKey] of article.imageKeys.entries()) {
      const file = await uploadImageFromUrl(
        prisma,
        IMAGES[imageKey],
        "article/gallery",
        `${article.englishTitle.replaceAll(" ", "-")}-${index + 1}.jpg`
      );
      gallery.push({ fileId: file.id, sortOrder: index });
    }

    const created = await prisma.article.create({
      data: {
        title: article.title,
        englishTitle: article.englishTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        isSuggested: article.isSuggested ?? false,
        status: article.status ?? "PUBLISHED",
        created_at: article.createdAt,
        content: richContent(article.sections),
        galleryFiles: {
          create: gallery,
        },
      },
    });

    articlesByEnglishTitle.set(article.englishTitle, created.id);
  }

  console.log(`Seeded ${articles.length} articles`);

  const shippingSpecs = [
    { name: "پست پیشتاز", imageKey: "packages" as const, file: "post.jpg", price: 65000, isActive: true, sortOrder: 1 },
    { name: "تیپاکس", imageKey: "warehouse" as const, file: "tipax.jpg", price: 85000, isActive: true, sortOrder: 2 },
    { name: "چاپار", imageKey: "delivery" as const, file: "chapar.jpg", price: 75000, isActive: true, sortOrder: 3 },
    { name: "پادرو", imageKey: "delivery" as const, file: "podro.jpg", price: 0, isActive: false, sortOrder: 99 },
  ];

  const shippingByName = new Map<string, string>();

  for (const partner of shippingSpecs) {
    const image = await uploadImageFromUrl(
      prisma,
      IMAGES[partner.imageKey],
      "shipping",
      partner.file
    );
    const created = await prisma.shippingPartner.create({
      data: {
        name: partner.name,
        price: partner.price,
        isActive: partner.isActive,
        sortOrder: partner.sortOrder,
        imageFileId: image.id,
      },
    });
    shippingByName.set(partner.name, created.id);
  }

  console.log(`Seeded ${shippingSpecs.length} shipping partners`);

  return { articlesByEnglishTitle, shippingByName };
}
