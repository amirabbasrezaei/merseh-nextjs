import { articles } from "./data/articles";
import { IMAGES } from "./data/images";
import { richContent } from "./content";
import { uploadImageFromUrl } from "./media";
import type { CatalogResult, EditorialResult, SeedPrisma } from "./types";

export async function seedEditorial(
  prisma: SeedPrisma,
  catalog: CatalogResult
): Promise<EditorialResult> {
  const herbalId = catalog.categoriesBySlug.get("herbal-oils");
  const skinId = catalog.categoriesBySlug.get("skin-care");
  const hairId = catalog.categoriesBySlug.get("hair-care");
  const sunId = catalog.categoriesBySlug.get("sunscreen");
  const argan = catalog.productsByEngName.get("Merseh Pure Argan Oil");

  if (!herbalId || !skinId || !hairId || !sunId || !argan) {
    throw new Error("Catalog is missing categories or argan oil for banners");
  }

  const bannerSpecs = [
    {
      placement: "HERO" as const,
      title: "روغن‌های گیاهی مرسه",
      href: `/category/${herbalId}/روغن‌های-گیاهی`,
      sortOrder: 0,
      imageKey: "heroOils" as const,
      fileName: "banner-hero-oils.jpg",
    },
    {
      placement: "HERO" as const,
      title: "روتین پوست روشن",
      href: `/category/${skinId}/مراقبت-پوست`,
      sortOrder: 1,
      imageKey: "heroSpa" as const,
      fileName: "banner-hero-skin.jpg",
    },
    {
      placement: "HERO" as const,
      title: "آرگان خالص",
      href: `/product/${argan.id}/روغن-آرگان-خالص-مرسه`,
      sortOrder: 2,
      imageKey: "heroMakeup" as const,
      fileName: "banner-hero-argan.jpg",
    },
    {
      placement: "SIDE" as const,
      title: "ضدآفتاب روزانه",
      href: `/category/${sunId}/ضدآفتاب`,
      sortOrder: 0,
      imageKey: "sideSerum" as const,
      fileName: "banner-side-sun.jpg",
    },
    {
      placement: "SIDE" as const,
      title: "مراقبت مو",
      href: `/category/${hairId}/مراقبت-مو`,
      sortOrder: 1,
      imageKey: "sideHair" as const,
      fileName: "banner-side-hair.jpg",
    },
  ];

  for (const banner of bannerSpecs) {
    const image = await uploadImageFromUrl(
      prisma,
      IMAGES[banner.imageKey],
      "banner",
      banner.fileName
    );
    await prisma.banner.create({
      data: {
        placement: banner.placement,
        title: banner.title,
        href: banner.href,
        sortOrder: banner.sortOrder,
        isActive: true,
        imageFileId: image.id,
      },
    });
  }

  console.log(`Seeded ${bannerSpecs.length} banners`);

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
    { name: "پست پیشتاز", imageKey: "packages" as const, file: "post.jpg" },
    { name: "تیپاکس", imageKey: "warehouse" as const, file: "tipax.jpg" },
    { name: "پادرو", imageKey: "delivery" as const, file: "podro.jpg" },
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
        imageFileId: image.id,
      },
    });
    shippingByName.set(partner.name, created.id);
  }

  console.log(`Seeded ${shippingSpecs.length} shipping partners`);

  return { articlesByEnglishTitle, shippingByName };
}
