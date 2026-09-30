import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import { childrenCategories } from "../utils/category";
import {
  mapProductCard,
  PRODUCT_SECTION_LIMIT,
  productCardInclude,
} from "../utils/productCard";
import {
  deleteStoredFile,
  publicUrl,
  uploadFromBase64,
} from "../utils/storage";
import { toPathSlug } from "@/utils/slug";
import type { HomeCarouselSource } from "@/generated/prisma/client";

const imageInput = z.object({
  base64: z.string().min(1),
  name: z.string().min(1),
});

const sourceSchema = z.enum(["CATEGORY", "BRAND", "MANUAL"]);

const carouselInclude = {
  logoFile: true,
  category: { select: { id: true, title: true } },
  brand: { select: { id: true, name: true, isActive: true } },
  products: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      product: {
        include: productCardInclude(),
      },
    },
  },
};

type CarouselRecord = {
  id: number;
  title: string;
  source: HomeCarouselSource;
  categoryId: number | null;
  brandId: number | null;
  sortOrder: number;
  isActive: boolean;
  logoFileId: string | null;
  logoFile: { key: string } | null;
  category: { id: number; title: string } | null;
  brand: { id: number; name: string; isActive: boolean } | null;
  products: {
    sortOrder: number;
    product: {
      id: number;
      name: string;
      status: string;
      price: number;
      galleryFiles?: { file: { key: string } }[];
      brand?: { id: number; name: string; isActive: boolean } | null;
    };
  }[];
};

function showMoreHref(carousel: {
  source: HomeCarouselSource;
  category: { id: number; title: string } | null;
  brand: { id: number; name: string; isActive: boolean } | null;
}) {
  if (carousel.source === "CATEGORY" && carousel.category) {
    return `/category/${carousel.category.id}/${toPathSlug(carousel.category.title)}`;
  }
  if (carousel.source === "BRAND" && carousel.brand?.isActive) {
    return `/brand/${carousel.brand.id}/${toPathSlug(carousel.brand.name)}`;
  }
  return null;
}

function mapCarouselAdmin(carousel: CarouselRecord) {
  return {
    id: carousel.id,
    title: carousel.title,
    source: carousel.source,
    categoryId: carousel.categoryId,
    brandId: carousel.brandId,
    sortOrder: carousel.sortOrder,
    isActive: carousel.isActive,
    logoUrl: carousel.logoFile ? publicUrl(carousel.logoFile.key) : null,
    categoryTitle: carousel.category?.title ?? null,
    brandName: carousel.brand?.name ?? null,
    showMoreHref: showMoreHref(carousel),
    products: carousel.products.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      status: item.product.status,
      sortOrder: item.sortOrder,
    })),
  };
}

async function resolveCarouselProducts(
  prisma: ArgsStructure["ctx"]["prisma"],
  carousel: CarouselRecord
) {
  if (carousel.source === "MANUAL") {
    return carousel.products
      .filter((item) => item.product.status === "PUBLISHED")
      .slice(0, PRODUCT_SECTION_LIMIT)
      .map((item) => mapProductCard(item.product));
  }

  if (carousel.source === "CATEGORY" && carousel.categoryId) {
    const children = await childrenCategories({
      categoryId: carousel.categoryId,
    });
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        category: {
          some: { id: { in: [carousel.categoryId, ...children] } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: PRODUCT_SECTION_LIMIT,
      include: productCardInclude(),
    });
    return products.map(mapProductCard);
  }

  if (carousel.source === "BRAND" && carousel.brandId) {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED", brandId: carousel.brandId },
      orderBy: { createdAt: "desc" },
      take: PRODUCT_SECTION_LIMIT,
      include: productCardInclude(),
    });
    return products.map(mapProductCard);
  }

  return [];
}

export async function listActiveCarouselsController({
  ctx: { prisma },
}: ArgsStructure) {
  const carousels = await prisma.homeCarousel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: carouselInclude,
  });

  const resolved = await Promise.all(
    carousels.map(async (carousel) => ({
      id: carousel.id,
      title: carousel.title,
      logoUrl: carousel.logoFile ? publicUrl(carousel.logoFile.key) : null,
      showMoreHref: showMoreHref(carousel),
      products: await resolveCarouselProducts(prisma, carousel),
    }))
  );

  return {
    carousels: resolved.filter((carousel) => carousel.products.length > 0),
  };
}

export async function listCarouselsAdminController({
  ctx: { prisma },
}: ArgsStructure) {
  const carousels = await prisma.homeCarousel.findMany({
    orderBy: { sortOrder: "asc" },
    include: carouselInclude,
  });
  return { carousels: carousels.map(mapCarouselAdmin) };
}

export const carouselIdInput = z.object({
  id: z.number().int(),
});

export async function getCarouselAdminController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof carouselIdInput>>) {
  const carousel = await prisma.homeCarousel.findUnique({
    where: { id: input.id },
    include: carouselInclude,
  });
  if (!carousel) {
    throw new TRPCError({ code: "NOT_FOUND", message: "کاروسل یافت نشد" });
  }
  return { carousel: mapCarouselAdmin(carousel) };
}

const carouselFields = {
  title: z.string().trim().min(1),
  source: sourceSchema,
  categoryId: z.number().int().nullable().optional(),
  brandId: z.number().int().nullable().optional(),
  productIds: z.array(z.number().int()).max(PRODUCT_SECTION_LIMIT).optional(),
  isActive: z.boolean().optional(),
  image: imageInput.optional(),
};

function sourceData(input: {
  source: HomeCarouselSource;
  categoryId?: number | null;
  brandId?: number | null;
}) {
  if (input.source === "CATEGORY") {
    if (!input.categoryId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "یک دسته‌بندی انتخاب کنید",
      });
    }
    return { categoryId: input.categoryId, brandId: null };
  }
  if (input.source === "BRAND") {
    if (!input.brandId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "یک برند انتخاب کنید",
      });
    }
    return { categoryId: null, brandId: input.brandId };
  }
  return { categoryId: null, brandId: null };
}

async function replaceManualProducts(
  prisma: ArgsStructure["ctx"]["prisma"],
  carouselId: number,
  source: HomeCarouselSource,
  productIds: number[] | undefined
) {
  await prisma.homeCarouselProduct.deleteMany({ where: { carouselId } });
  if (source !== "MANUAL" || !productIds?.length) return;

  const uniqueIds = [...new Set(productIds)].slice(0, PRODUCT_SECTION_LIMIT);
  const found = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((product) => product.id));
  const orderedIds = uniqueIds.filter((id) => foundIds.has(id));
  if (!orderedIds.length) return;

  await prisma.homeCarouselProduct.createMany({
    data: orderedIds.map((productId, index) => ({
      carouselId,
      productId,
      sortOrder: index,
    })),
  });
}

export const createCarouselInput = z.object(carouselFields);

export async function createCarouselController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof createCarouselInput>>) {
  const links = sourceData(input);
  let logoFileId: string | null = null;
  if (input.image) {
    const file = await uploadFromBase64(input.image, "carousel");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود لوگو ناموفق بود",
      });
    }
    logoFileId = file.id;
  }

  const maxOrder = await prisma.homeCarousel.aggregate({
    _max: { sortOrder: true },
  });

  const carousel = await prisma.homeCarousel.create({
    data: {
      title: input.title,
      source: input.source,
      isActive: input.isActive ?? true,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      logoFileId,
      ...links,
    },
  });

  await replaceManualProducts(
    prisma,
    carousel.id,
    input.source,
    input.productIds
  );

  const saved = await prisma.homeCarousel.findUniqueOrThrow({
    where: { id: carousel.id },
    include: carouselInclude,
  });
  return { carousel: mapCarouselAdmin(saved) };
}

export const updateCarouselInput = z.object({
  id: z.number().int(),
  ...carouselFields,
  removeLogo: z.boolean().optional(),
});

export async function updateCarouselController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof updateCarouselInput>>) {
  const existing = await prisma.homeCarousel.findUnique({
    where: { id: input.id },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "کاروسل یافت نشد" });
  }

  const links = sourceData(input);
  let logoFileId = existing.logoFileId;
  let replacedFileId: string | null = null;

  if (input.image) {
    const file = await uploadFromBase64(input.image, "carousel");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود لوگو ناموفق بود",
      });
    }
    replacedFileId = existing.logoFileId;
    logoFileId = file.id;
  } else if (input.removeLogo) {
    replacedFileId = existing.logoFileId;
    logoFileId = null;
  }

  await prisma.homeCarousel.update({
    where: { id: input.id },
    data: {
      title: input.title,
      source: input.source,
      isActive: input.isActive,
      logoFileId,
      ...links,
    },
  });

  await replaceManualProducts(prisma, input.id, input.source, input.productIds);

  if (replacedFileId && replacedFileId !== logoFileId) {
    await deleteStoredFile(replacedFileId);
  }

  const saved = await prisma.homeCarousel.findUniqueOrThrow({
    where: { id: input.id },
    include: carouselInclude,
  });
  return { carousel: mapCarouselAdmin(saved) };
}

export const reorderCarouselsInput = z.object({
  orderedIds: z.array(z.number().int()),
});

export async function reorderCarouselsController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof reorderCarouselsInput>>) {
  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.homeCarousel.updateMany({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
  return { status: "ok" as const };
}

export const setCarouselActiveInput = z.object({
  id: z.number().int(),
  isActive: z.boolean(),
});

export async function setCarouselActiveController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof setCarouselActiveInput>>) {
  await prisma.homeCarousel.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
  });
  return { status: "ok" as const };
}

export async function deleteCarouselController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof carouselIdInput>>) {
  const existing = await prisma.homeCarousel.findUnique({
    where: { id: input.id },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "کاروسل یافت نشد" });
  }
  await prisma.homeCarousel.delete({ where: { id: input.id } });
  if (existing.logoFileId) {
    await deleteStoredFile(existing.logoFileId);
  }
  return { status: "ok" as const };
}

export const searchCarouselProductsInput = z.object({
  query: z.string().trim().min(1),
});

export async function searchCarouselProductsController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof searchCarouselProductsInput>>) {
  const products = await prisma.product.findMany({
    where: {
      name: { contains: input.query },
      status: { not: "ARCHIVED" },
    },
    select: { id: true, name: true, status: true },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  return { products };
}
