import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ArgsStructure } from "./category.controller";
import CitiesJson from "../../public/gistfile1.json";
import { publicUrl } from "../utils/storage";
import { activeCarrierWhere, carrierWhere } from "../utils/shippingCarriers";

type CarrierRecord = {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  imageFile: { key: string } | null;
};

function mapCarrier(carrier: CarrierRecord) {
  return {
    id: carrier.id,
    name: carrier.name,
    price: carrier.price,
    isActive: carrier.isActive,
    imageUrl: carrier.imageFile ? publicUrl(carrier.imageFile.key) : null,
  };
}

export async function shippingMethodsController({ ctx }: ArgsStructure) {
  const carriers = await ctx.prisma.shippingPartner.findMany({
    where: activeCarrierWhere,
    orderBy: { sortOrder: "asc" },
    include: { imageFile: { select: { key: true } } },
  });
  return { methods: carriers.map(mapCarrier) };
}

export async function listCarriersAdminController({ ctx }: ArgsStructure) {
  const carriers = await ctx.prisma.shippingPartner.findMany({
    where: carrierWhere,
    orderBy: { sortOrder: "asc" },
    include: { imageFile: { select: { key: true } } },
  });
  return { carriers: carriers.map(mapCarrier) };
}

export const updateCarrierInput = z.object({
  id: z.string().min(1),
  price: z.number().int().min(0),
  isActive: z.boolean(),
});

export async function updateCarrierController({
  ctx,
  input,
}: ArgsStructure<z.infer<typeof updateCarrierInput>>) {
  const { prisma } = ctx;
  const carrier = await prisma.shippingPartner.findFirst({
    where: { id: input.id, ...carrierWhere },
    select: { id: true },
  });
  if (!carrier) {
    throw new TRPCError({ code: "NOT_FOUND", message: "روش ارسال یافت نشد" });
  }
  if (input.isActive && input.price <= 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "برای فعال‌کردن، هزینه ارسال را وارد کنید",
    });
  }

  const updated = await prisma.shippingPartner.update({
    where: { id: carrier.id },
    data: { price: input.price, isActive: input.isActive },
    include: { imageFile: { select: { key: true } } },
  });
  return { carrier: mapCarrier(updated) };
}

export async function userAddressesController({ ctx }: ArgsStructure) {
  const { prisma, user } = ctx;
  try {
    const userAddresses = await prisma.address.findMany({
      where: { userId: user.userId },
      include: {
        Province: {
          select: {
            name: true,
          },
        },
        city: {
          select: {
            name: true,
          },
        },
      },
    });
    if (userAddresses) {
      const updatedUserAddresses = userAddresses.map((e) => ({
        ...e,
        postalCode: e.postalCode?.toString(),
      }));
      return {
        addresses: updatedUserAddresses,
        error: null,
        need_to_add_address: false,
      };
    }
    return {
      addresses: null,
      error: null,
      need_to_add_address: true,
      message: "لطفا آدرس جدیدی ثبت کنید",
    };
  } catch (error) {
    return {
      addresses: null,
      error,
      need_to_add_address: false,
      message: "خطا در واکشی اطلاعات",
    };
  }
}

export const AddAddressInputSchema = z.object({
  coordinate: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  addressTitle: z.string().optional(),
  reciverInfo: z.object({
    name: z.string().optional(),
    familyName: z.string().optional(),
  }),
  phoneNumber: z
    .string()
    .regex(/((0?9)|(\+?989))\d{2}\W?\d{3}\W?\d{4}/g)
    .or(z.string().optional()),
  provinceId: z.number().int().positive(),
  cityId: z.number().int().positive(),
  detailedAddress: z.string(),
  postalCode: z.string().length(10),
});

type AddAddressInput = z.infer<typeof AddAddressInputSchema>;

export async function addAddressController({
  ctx,
  input,
}: ArgsStructure<AddAddressInput>) {
  const { prisma, user } = ctx;
  try {
    if (
      !input?.reciverInfo?.familyName ||
      !input?.reciverInfo?.name ||
      !input.phoneNumber
    ) {
      const userInfo = await prisma.user.findUnique({
        where: {
          id: user.userId,
        },
      });
      if (userInfo) {
        const address = await prisma.address.create({
          data: {
            userId: user.userId,
            addressDetails: input.detailedAddress,
            title: input.addressTitle || "",
            cityId: input.cityId,
            provinceId: input.provinceId,
            latitude: input.coordinate.latitude,
            longitude: input.coordinate.longitude,
            reciverFamilyName: userInfo?.familyName?.length
              ? userInfo?.familyName
              : " ",
            reciverName: userInfo.name,
            reciverPhoneNumber: userInfo.phoneNumber,
            postalCode: BigInt(input.postalCode),
          },
        });
        return { status: "ok", error: null, addressId: address.id };
      }
      return { status: "ok", error: "cannot find user", addressId: null };
    }
    const address = await prisma.address.create({
      data: {
        userId: user.userId,
        addressDetails: input.detailedAddress,
        title: input.addressTitle || "",
        cityId: input.cityId,
        provinceId: input.provinceId,
        latitude: input.coordinate.latitude,
        longitude: input.coordinate.longitude,
        reciverFamilyName: input.reciverInfo.familyName,
        reciverName: input.reciverInfo.name,
        reciverPhoneNumber: input.phoneNumber,
        postalCode: BigInt(input.postalCode),
      },
    });

    return { status: "ok", error: null, addressId: address.id };
  } catch (error) {
    console.log(error);
    return { status: "failed", error, addressId: null };
  }
}

export const GetCitiesInputSchema = z.object({
  provinceId: z.number().optional(),
});

type GetCitiesInput = z.infer<typeof GetCitiesInputSchema>;
export async function getCitiesController({
  ctx,
  input,
}: ArgsStructure<GetCitiesInput>) {
  const { prisma } = ctx;

  try {
    const provinces = await prisma.province.findMany();

    if (input.provinceId) {
      try {
        const cities = await prisma.city.findMany({
          where: {
            provinceId: input.provinceId,
          },
        });

        return { result: "ok", error: null, cities, provinces };
      } catch (error) {
        return { result: "failed", error, cities: null, provinces: null };
      }
    }

    return { result: "ok", error: null, provinces, cities: null };
  } catch (error) {
    return { result: "failed", error, cities: null, provinces: null };
  }
}

export async function importCities({ ctx }: ArgsStructure) {
  for (let province of CitiesJson) {
    const createdPr = await ctx.prisma.province.create({
      data: {
        engName: "",
        name: province.name,
      },
    });

    for (let city of province.cities) {
      await ctx.prisma.city.create({
        data: {
          engName: "",
          name: city.name,
          provinceId: createdPr.id,
          podroCode: city.code,
        },
      });
    }
  }
}
