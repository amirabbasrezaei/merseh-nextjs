import { richContent } from "./content";
import { uploadImageFromUrl } from "./media";
import type { CatalogResult, SeedPrisma } from "./types";

const STORE_API = "https://mohanacosmetic.com/wp-json/wc/store/v1";
const PRODUCTS_PER_CATEGORY = 10;
const DEFAULT_PRICE = 250_000;
const MAX_PRODUCT_PAGES = 10;

type WpImage = {
  src: string;
  alt?: string;
  name?: string;
};

type WpTerm = string | { name?: string };

type WpAttribute = {
  name: string;
  has_variations?: boolean;
  terms?: WpTerm[];
};

type WpCategory = {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
  image: { src?: string } | null;
};

type WpProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  parent: number;
  on_sale?: boolean;
  prices?: {
    price?: string;
    regular_price?: string;
    sale_price?: string;
  };
  categories?: Array<{ id: number; name: string }>;
  short_description?: string;
  description?: string;
  images?: WpImage[];
  attributes?: WpAttribute[];
};

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

function spacedSlug(slug: string) {
  return decodeSlug(slug).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code))
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(Number.parseInt(code, 16))
    );
}

function stripHtml(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseSpecTable(html: string) {
  const details: string[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(
      (cell) => stripHtml(cell[1])
    );
    if (cells.length < 2) continue;
    const [key, value] = cells;
    if (!key || !value) continue;
    if (key === "ویژگی" && value === "توضیحات") continue;
    details.push(`${key}: ${value}`);
  }
  return details;
}

function parseListItems(html: string) {
  return [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((item) => stripHtml(item[1]))
    .filter(Boolean);
}

function proseSections(html: string) {
  const withoutTable = html.replace(/<table\b[\s\S]*?<\/table>/gi, "");
  const heading = [...withoutTable.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((match) => stripHtml(match[1]))
    .find(Boolean);
  const paragraphs = [...withoutTable.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => stripHtml(match[1]))
    .filter((paragraph) => paragraph.length > 1)
    .slice(0, 6);

  if (!heading && !paragraphs.length) return [];
  return [{ heading, paragraphs }];
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function termNames(attribute: WpAttribute) {
  return uniqueStrings(
    (attribute.terms ?? []).map((term) =>
      typeof term === "string" ? term : (term.name ?? "")
    )
  );
}

function money(value: string | undefined) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (parsed > 2_000_000_000) return DEFAULT_PRICE;
  return parsed;
}

function resolvePrice(product: WpProduct) {
  const current = money(product.prices?.price);
  const regular = money(product.prices?.regular_price);
  const sale = money(product.prices?.sale_price);
  const list = regular || current || DEFAULT_PRICE;
  const onSale = Boolean(product.on_sale) && sale > 0 && sale < list;
  return {
    price: list,
    discount: onSale ? list - sale : 0,
  };
}

function originalNameFromUrl(url: string, fallback: string) {
  try {
    const base = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    if (base.includes(".")) return base.slice(0, 120);
  } catch {
    // Keep the fallback name when the URL is not parseable.
  }
  return fallback;
}

async function fetchJson<T>(path: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(`${STORE_API}${path}`, {
        signal: controller.signal,
        headers: {
          "User-Agent": "merseh-seed/1.0",
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${path}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Failed to fetch ${path}: ${String(lastError)}`);
}

async function fetchParentProducts(
  categoryId: number,
  seenProductIds: Set<number>
) {
  const products: WpProduct[] = [];

  for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
    if (products.length >= PRODUCTS_PER_CATEGORY) break;

    const batch = await fetchJson<WpProduct[]>(
      `/products?category=${categoryId}&per_page=100&page=${page}`
    );
    if (!Array.isArray(batch) || batch.length === 0) break;

    for (const product of batch) {
      if (product.type === "variation" || product.parent !== 0) continue;
      if (seenProductIds.has(product.id)) continue;
      seenProductIds.add(product.id);
      products.push(product);
      if (products.length >= PRODUCTS_PER_CATEGORY) break;
    }

    if (batch.length < 100) break;
  }

  return products;
}

function variationFrom(product: WpProduct) {
  const attribute = (product.attributes ?? []).find((item) => {
    if (termNames(item).length < 2) return false;
    return item.has_variations || product.type === "variable";
  });
  if (!attribute) return null;
  return { name: attribute.name, values: termNames(attribute) };
}

const HOME_PAGE = "https://mohanacosmetic.com/";
const HOME_CSS =
  "https://mohanacosmetic.com/wp-content/uploads/elementor/css/post-24187.css";

export type MohanaBanner = {
  placement: "HERO" | "SIDE";
  imageUrl: string;
  remoteHref: string;
};

async function fetchText(url: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { "User-Agent": "merseh-seed/1.0", Accept: "text/html,text/css" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`Failed to fetch ${url}: ${String(lastError)}`);
}

export async function fetchMohanaHomeBanners(): Promise<MohanaBanner[]> {
  const [html, css] = await Promise.all([fetchText(HOME_PAGE), fetchText(HOME_CSS)]);

  const imageBySlide = new Map<string, string>();
  for (const match of css.matchAll(
    /\.elementor-repeater-item-([a-z0-9]+)[^{]*\{[^}]*url\(([^)]+)\)/gi
  )) {
    imageBySlide.set(match[1], match[2].replace(/['"]/g, ""));
  }

  const swiperStarts = [...html.matchAll(/elementor-main-swiper/g)].map(
    (match) => match.index ?? 0
  );
  const heroStart = swiperStarts[1] ?? swiperStarts[0] ?? 0;
  const heroHtml = html.slice(heroStart, (swiperStarts[2] ?? heroStart) + 40_000);
  const banners: MohanaBanner[] = [];
  const seen = new Set<string>();

  for (const match of heroHtml.matchAll(
    /elementor-repeater-item-([a-z0-9]+)\s+swiper-slide[\s\S]*?href="([^"]+)"/g
  )) {
    const imageUrl = imageBySlide.get(match[1]);
    if (!imageUrl || seen.has(imageUrl)) continue;
    seen.add(imageUrl);
    banners.push({ placement: "HERO", imageUrl, remoteHref: match[2] });
  }

  for (const block of html.split("promo-banner-wrapper").slice(1)) {
    const src = block.match(
      /data-src="(https:\/\/mohanacosmetic\.com\/wp-content\/uploads\/[^"]+\.(?:jpe?g|png|webp))"/i
    );
    const linkTag = block.match(/<a\b[^>]*wd-promo-banner-link[^>]*>/i)?.[0] ?? "";
    const href = linkTag.match(/href="([^"]+)"/);
    if (!src || !href) continue;
    const imageUrl = src[1];
    if (/-\d+x\d+\./.test(imageUrl) || seen.has(imageUrl)) continue;
    const fileName = decodeURIComponent(imageUrl.split("/").pop() || "");
    if (!/محصولات|مهنا/.test(fileName)) continue;
    seen.add(imageUrl);
    banners.push({ placement: "SIDE", imageUrl, remoteHref: href[1] });
    if (banners.filter((banner) => banner.placement === "SIDE").length >= 5) break;
  }

  if (!banners.some((banner) => banner.placement === "HERO")) {
    throw new Error("Mohana homepage slider images were not found");
  }

  return banners;
}

async function fetchAllCategories() {
  const categories: WpCategory[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= 5; page++) {
    let batch: WpCategory[];
    try {
      batch = await fetchJson<WpCategory[]>(
        `/products/categories?per_page=100&page=${page}`
      );
    } catch (error) {
      if (page === 1) throw error;
      break;
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    for (const category of batch) {
      if (seen.has(category.id)) continue;
      seen.add(category.id);
      categories.push(category);
    }
    if (batch.length < 100) break;
  }

  return categories;
}

export async function seedMohana(prisma: SeedPrisma): Promise<CatalogResult> {
  const categories = await fetchAllCategories();
  const wpById = new Map(categories.map((category) => [category.id, category]));
  const topLevel = categories
    .filter((category) => category.parent === 0)
    .sort((left, right) => left.count - right.count);

  if (!topLevel.length) {
    throw new Error("Mohana store API returned no top-level categories");
  }

  console.log(`Fetching products for ${topLevel.length} Mohana categories`);

  const seenProductIds = new Set<number>();
  const buckets: Array<{ category: WpCategory; products: WpProduct[] }> = [];

  for (const category of topLevel) {
    const products = await fetchParentProducts(category.id, seenProductIds);
    console.log(
      `  ${category.name}: ${products.length} products (catalog count ${category.count})`
    );
    buckets.push({ category, products });
  }

  const categoriesBySlug = new Map<string, number>();
  const categoryIdByWpId = new Map<number, number>();
  const usedSlugs = new Set<string>();
  const productsByWpId = new Map(buckets.map((bucket) => [bucket.category.id, bucket.products]));

  const rootImageUrl = buckets.find((bucket) => bucket.products[0]?.images?.[0]?.src)
    ?.products[0]?.images?.[0]?.src;
  const rootImage = rootImageUrl
    ? await uploadImageFromUrl(
        prisma,
        rootImageUrl,
        "category",
        originalNameFromUrl(rootImageUrl, "all-products.jpg")
      )
    : null;
  const root = await prisma.category.create({
    data: {
      title: "همه محصولات",
      englishTitle: "All Products",
      metaDescription: "همه دسته‌های فروشگاه مهنا کازمتیک.",
      content: richContent([
        { paragraphs: ["همه دسته‌های فروشگاه، از آرایش تا مراقبت پوست، مو و بدن."] },
      ]),
      status: "ENABLED",
      parentCategoryId: null,
      imageFileId: rootImage?.id,
    },
  });
  categoriesBySlug.set("all-products", root.id);

  const pending = new Map(categories.map((category) => [category.id, category]));
  while (pending.size) {
    let createdOne = false;
    for (const [wpId, category] of pending) {
      const parentId =
        category.parent === 0 ? root.id : categoryIdByWpId.get(category.parent);
      if (category.parent !== 0 && parentId === undefined) continue;

      let slug =
        decodeSlug(category.slug).replace(/\s+/g, "-") || `category-${category.id}`;
      if (usedSlugs.has(slug)) slug = `${slug}-${category.id}`;
      usedSlugs.add(slug);

      const imageUrl =
        category.image?.src || productsByWpId.get(category.id)?.[0]?.images?.[0]?.src;
      const image = imageUrl
        ? await uploadImageFromUrl(
            prisma,
            imageUrl,
            "category",
            originalNameFromUrl(imageUrl, `${slug}.jpg`)
          )
        : null;
      const title = decodeEntities(category.name).replace(/\s+/g, " ").trim();
      const description =
        stripHtml(category.description) || `مجموعه‌ای از ${title} برای فروشگاه.`;

      const created = await prisma.category.create({
        data: {
          title,
          englishTitle: spacedSlug(category.slug) || title,
          metaDescription: description.slice(0, 300),
          content: richContent([{ paragraphs: [description] }]),
          status: "ENABLED",
          parentCategoryId: parentId,
          imageFileId: image?.id,
        },
      });

      categoriesBySlug.set(slug, created.id);
      categoryIdByWpId.set(wpId, created.id);
      pending.delete(wpId);
      createdOne = true;
    }

    if (!createdOne) {
      throw new Error(
        `Could not place Mohana categories: ${[...pending.keys()].join(", ")}`
      );
    }
  }

  console.log(`Seeded ${categoriesBySlug.size} categories from Mohana`);

  const productsByEngName: CatalogResult["productsByEngName"] = new Map();
  const usedEngNames = new Set<string>();

  for (const { category, products } of buckets) {
    const mainCategoryId = categoryIdByWpId.get(category.id);
    if (mainCategoryId === undefined) {
      throw new Error(`Missing seeded category for ${category.name}`);
    }

    for (const product of products) {
      const name = decodeEntities(product.name).replace(/\s+/g, " ").trim();
      let engName = spacedSlug(product.slug) || `product ${product.id}`;
      if (usedEngNames.has(engName)) engName = `${engName} ${product.id}`;
      usedEngNames.add(engName);

      const gallery = [];
      for (const [index, image] of (product.images ?? []).entries()) {
        if (!image.src) continue;
        const file = await uploadImageFromUrl(
          prisma,
          image.src,
          "product/gallery",
          originalNameFromUrl(image.src, `${product.id}-${index + 1}.jpg`)
        );
        gallery.push({ fileId: file.id, sortOrder: index });
      }

      const shortHtml = product.short_description ?? "";
      const descriptionHtml = product.description ?? "";
      const details = uniqueStrings([
        ...parseSpecTable(descriptionHtml),
        ...parseListItems(shortHtml),
      ]).slice(0, 20);
      const sections = proseSections(descriptionHtml);
      const shortText = stripHtml(shortHtml);
      const { price, discount } = resolvePrice(product);
      const brand = (product.attributes ?? []).find((item) => item.name === "برند");
      const keywords = uniqueStrings([
        category.name,
        ...(product.categories ?? []).map((item) => item.name),
        ...(brand ? termNames(brand) : []),
      ]).slice(0, 8);

      const linkedCategoryIds = new Set<number>([mainCategoryId, root.id]);
      for (const item of product.categories ?? []) {
        let current: number | undefined = item.id;
        const seenWp = new Set<number>();
        while (current && !seenWp.has(current)) {
          seenWp.add(current);
          const seeded = categoryIdByWpId.get(current);
          if (seeded !== undefined) linkedCategoryIds.add(seeded);
          const ancestorId: number | undefined = wpById.get(current)?.parent;
          current = ancestorId ? ancestorId : undefined;
        }
      }

      const variation = variationFrom(product);

      const created = await prisma.product.create({
        data: {
          name,
          engName,
          price,
          discount,
          quantity: 10,
          status: "PUBLISHED",
          mainCategoryId,
          metaDescription: (shortText || name).slice(0, 300),
          content_keywords: keywords,
          details,
          content: richContent(
            sections.length
              ? sections
              : [{ paragraphs: [shortText || name] }]
          ),
          category: {
            connect: [...linkedCategoryIds].map((id) => ({ id })),
          },
          galleryFiles: gallery.length ? { create: gallery } : undefined,
          ProductVariation: variation
            ? {
                create: {
                  variateName: variation.name,
                  values: {
                    create: variation.values.map((value) => ({
                      name: value,
                      price,
                      discount,
                      quantity: 10,
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

      const createdVariation = created.ProductVariation[0];
      const firstValue = createdVariation?.values[0];
      productsByEngName.set(engName, {
        id: created.id,
        variation:
          createdVariation && firstValue
            ? { id: createdVariation.id, valueId: firstValue.id }
            : undefined,
      });

      console.log(
        `  product ${created.id}: ${name} (${gallery.length} images)`
      );
    }
  }

  console.log(`Seeded ${productsByEngName.size} products from Mohana`);
  return { productsByEngName, categoriesBySlug };
}
