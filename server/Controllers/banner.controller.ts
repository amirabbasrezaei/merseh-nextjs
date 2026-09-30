import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import {
  deleteStoredFile,
  publicUrl,
  uploadFromBase64,
} from "../utils/storage";

const bannerInclude = {
  imageFile: true,
} as const;

function mapBanner(banner: {
  id: string;
  placement: "HERO" | "SIDE";
  title: string | null;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
  imageFileId: string;
  imageFile: { key: string };
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: banner.id,
    placement: banner.placement,
    title: banner.title,
    href: banner.href,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    imageFileId: banner.imageFileId,
    imageUrl: publicUrl(banner.imageFile.key),
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  };
}

export async function listActiveBannersController({
  ctx: { prisma },
}: ArgsStructure) {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
    include: bannerInclude,
  });
  return {
    hero: banners.filter((b) => b.placement === "HERO").map(mapBanner),
    side: banners.filter((b) => b.placement === "SIDE").map(mapBanner),
  };
}

export async function listBannersAdminController({
  ctx: { prisma },
}: ArgsStructure) {
  const banners = await prisma.banner.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
    include: bannerInclude,
  });
  return {
    hero: banners.filter((b) => b.placement === "HERO").map(mapBanner),
    side: banners.filter((b) => b.placement === "SIDE").map(mapBanner),
  };
}

export const createBannerInput = z.object({
  placement: z.enum(["HERO", "SIDE"]),
  title: z.string().optional(),
  href: z.string().optional(),
  image: z.object({
    base64: z.string().min(1),
    name: z.string().min(1),
  }),
  isActive: z.boolean().optional(),
});

export async function createBannerController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof createBannerInput>>) {
  try {
    const file = await uploadFromBase64(input.image, "banner");
    if (!file) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "آپلود تصویر بنر ناموفق بود",
      });
    }

    const maxOrder = await prisma.banner.aggregate({
      where: { placement: input.placement },
      _max: { sortOrder: true },
    });

    const banner = await prisma.banner.create({
      data: {
        placement: input.placement,
        title: input.title || null,
        href: input.href || null,
        isActive: input.isActive ?? true,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        imageFileId: file.id,
      },
      include: bannerInclude,
    });

    return { banner: mapBanner(banner) };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String(error),
    });
  }
}

export const updateBannerInput = z.object({
  id: z.string().uuid(),
  title: z.string().optional().nullable(),
  href: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  image: z
    .object({
      base64: z.string().min(1),
      name: z.string().min(1),
    })
    .optional(),
});

export async function updateBannerController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof updateBannerInput>>) {
  try {
    const existing = await prisma.banner.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      throw new TRPCError({ code: "NOT_FOUND", message: "بنر یافت نشد" });
    }

    let imageFileId = existing.imageFileId;
    if (input.image) {
      const file = await uploadFromBase64(input.image, "banner");
      if (!file) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "آپلود تصویر بنر ناموفق بود",
        });
      }
      imageFileId = file.id;
    }

    const banner = await prisma.banner.update({
      where: { id: input.id },
      data: {
        title: input.title === undefined ? undefined : input.title,
        href: input.href === undefined ? undefined : input.href,
        isActive: input.isActive,
        imageFileId,
      },
      include: bannerInclude,
    });

    if (input.image && existing.imageFileId !== imageFileId) {
      await deleteStoredFile(existing.imageFileId);
    }

    return { banner: mapBanner(banner) };
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String(error),
    });
  }
}

export const reorderBannersInput = z.object({
  placement: z.enum(["HERO", "SIDE"]),
  orderedIds: z.array(z.string().uuid()),
});

export async function reorderBannersController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof reorderBannersInput>>) {
  await prisma.$transaction(
    input.orderedIds.map((id, index) =>
      prisma.banner.updateMany({
        where: { id, placement: input.placement },
        data: { sortOrder: index },
      })
    )
  );
  return { status: "ok" as const };
}

export const setBannerActiveInput = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
});

export async function setBannerActiveController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof setBannerActiveInput>>) {
  const banner = await prisma.banner.update({
    where: { id: input.id },
    data: { isActive: input.isActive },
    include: bannerInclude,
  });
  return { banner: mapBanner(banner) };
}

export const deleteBannerInput = z.object({
  id: z.string().uuid(),
});

export async function deleteBannerController({
  ctx: { prisma },
  input,
}: ArgsStructure<z.infer<typeof deleteBannerInput>>) {
  const existing = await prisma.banner.findUnique({
    where: { id: input.id },
  });
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "بنر یافت نشد" });
  }

  await prisma.banner.delete({ where: { id: input.id } });
  await deleteStoredFile(existing.imageFileId);
  return { status: "ok" as const };
}
