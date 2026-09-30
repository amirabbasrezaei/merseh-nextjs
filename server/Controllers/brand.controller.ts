import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import {
  deleteStoredFile,
  publicUrl,
  uploadFromBase64,
} from "../utils/storage";
import { mapProductCard, productCardInclude } from "../utils/productCard";

const imageInput = z.object({
  base64: z.string().min(1),
  name: z.string().min(1),
});

const brandInclude = {
  logoFile: true,
  _count: { select: { products: true } },
} as const;

function mapBrand(brand: {
  id: number;
  name: string;
  englishName: string;
  content: string;
  metaDescription: string;
  isActive: boolean;
  logoFileId: string | null;
  logoFile: { key: string } | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}) {
  return {
    id: brand.id,
    name: brand.name,
    englishName: brand.englishName,
    content: brand.content,
    metaDescription: brand.metaDescription,
    isActive: brand.isActive,
    logoFileId: brand.logoFileId,
    logoUrl: brand.logoFile ? publicUrl(brand.logoFile.key) : null,
    productCount: brand._count?.products ?? 0,
    createdAt: brand.createdAt,
    updatedAt: brand.updatedAt,
  };
}

export async function listBrandsAdminController({
  ctx: { prisma },
}: ArgsStructure) {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: brandInclude,
  });
  return { brands: brands.map(mapBrand) };
}

export async function listActiveBrandsController({
  ctx: { prisma },
}: ArgsStructure) {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: { logoFile: true },
  });
  return {
    brands: brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      logoUrl: brand.logoFile ? publicUrl(brand.logoFile.key) : null,
    })),
  };
}

export const brandIdInput = z.object({
  id: z.number().int(),
});

export async function getBrandAdminController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof brandIdInput>>) {
  const brand = await prisma.brand.findUnique({
    where: { id: input.id },
    include: brandInclude,
  });
  if (!brand) {
    throw new TRPCError({ code: "NOT_FOUND", message: "برند یافت نشد" });
  }
  return { brand: mapBrand(brand) };
}

export async function brandInfoController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof brandIdInput>>) {
  const brand = await prisma.brand.findFirst({
    where: { id: input.id, isActive: true },
    include: { logoFile: true },
  });
  if (!brand) return { brand: null };
  return {
    brand: {
      id: brand.id,
      name: brand.name,
      englishName: brand.englishName,
      content: brand.content,
      metaDescription: brand.metaDescription,
      logoUrl: brand.logoFile ? publicUrl(brand.logoFile.key) : null,
    },
  };
}

export const brandProductsInput = z.object({
  brandId: z.number().int(),
  searchTerm: z.string().optional(),
});

export async function brandProductsController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof brandProductsInput>>) {
  const brand = await prisma.brand.findFirst({
    where: { id: input.brandId, isActive: true },
    select: { id: true },
  });
  if (!brand) {
    throw new TRPCError({ code: "NOT_FOUND", message: "برند یافت نشد" });
  }

  const searchTerm = input.searchTerm?.trim();
  const products = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      brandId: input.brandId,
      ...(searchTerm ? { name: { contains: searchTerm } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: productCardInclude(),
  });

  return { products: products.map(mapProductCard) };
}

export const createBrandInput = z.object({
  name: z.string().trim().min(1),
  englishName: z.string().optional(),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  image: imageInput.optional(),
});

export async function createBrandController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof createBrandInput>>) {
  let logoFileId: string | null = null;
  if (input.image) {
    const file = await uploadFromBase64(input.image, "brand");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود لوگو ناموفق بود",
      });
    }
    logoFileId = file.id;
  }

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      englishName: input.englishName?.trim() || "",
      content: input.content || "",
      metaDescription: input.metaDescription || "",
      isActive: input.isActive ?? true,
      logoFileId,
    },
    include: brandInclude,
  });

  return { brand: mapBrand(brand) };
}

export const updateBrandInput = z.object({
  id: z.number().int(),
  name: z.string().trim().min(1),
  englishName: z.string().optional(),
  content: z.string().optional(),
  metaDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  image: imageInput.optional(),
  removeLogo: z.boolean().optional(),
});

export async function updateBrandController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof updateBrandInput>>) {
  const existing = await prisma.brand.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "برند یافت نشد" });
  }

  let logoFileId = existing.logoFileId;
  let replacedFileId: string | null = null;

  if (input.image) {
    const file = await uploadFromBase64(input.image, "brand");
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

  const brand = await prisma.brand.update({
    where: { id: input.id },
    data: {
      name: input.name,
      englishName: input.englishName?.trim() || "",
      content: input.content || "",
      metaDescription: input.metaDescription || "",
      isActive: input.isActive,
      logoFileId,
    },
    include: brandInclude,
  });

  if (replacedFileId && replacedFileId !== logoFileId) {
    await deleteStoredFile(replacedFileId);
  }

  return { brand: mapBrand(brand) };
}

export const setBrandActiveInput = z.object({
  id: z.number().int(),
  isActive: z.boolean(),
});

export async function setBrandActiveController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof setBrandActiveInput>>) {
  const brand = await prisma.brand.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
    include: brandInclude,
  });
  return { brand: mapBrand(brand) };
}

export async function deleteBrandController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof brandIdInput>>) {
  const existing = await prisma.brand.findUnique({ where: { id: input.id } });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "برند یافت نشد" });
  }

  await prisma.brand.delete({ where: { id: input.id } });
  if (existing.logoFileId) {
    await deleteStoredFile(existing.logoFileId);
  }
  return { status: "ok" as const };
}
