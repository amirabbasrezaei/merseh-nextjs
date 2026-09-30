import { z } from "zod";
import { estimate_miare_price } from "./shipping/miare.controller";
import { ArgsStructure } from "./category.controller";
import CitiesJson from "../../public/gistfile1.json";
import { podroShippingPrices } from "./shipping/podro.controller";
import { publicUrl } from "../utils/storage";

export const ShippingPricesInputSchema = z.object({
  addressId: z.string(),
  orderId: z.number(),
});

type ShippingPricesInput = z.infer<typeof ShippingPricesInputSchema>;
export async function getShippingPricesController({
  ctx,
  input,
}: ArgsStructure<ShippingPricesInput>) {
  const { prisma, user } = ctx;

  try {
    const address = await prisma.address.findUnique({
      where: {
        id: input.addressId,
        User: {
          id: user.userId,
        },
      },
    });

    if (!address) {
      return {
        shippings: null,
        error: null,
        message: "need to add address",
        needToAddAddress: true,
      };
    }

    const order = await prisma.order.update({
      where: {
        id: input.orderId,
      },
      data: {
        addressId: input.addressId,
      },
      select: { Address: { select: { city: true } }, id: true },
    });

    const coordinateBody = {
      origin: {
        latitude: Number(process.env.STORE_LATITUDE) as number,
        longitude: Number(process.env.STORE_LONGITUDE) as number,
      },
      destination: {
        latitude: address.latitude,
        longitude: address.longitude,
      },
    };
    const shippings = [];
    if (order.Address?.city.podroCode === "2301") {
      const miare = await estimate_miare_price(coordinateBody);
      if (miare) {
        const miarePartner = await prisma.shippingPartner.findFirst({
          where: { name: "miare" },
          include: { imageFile: true },
        });
        shippings.push({
          shippingTypeName: "پیک موتوری",
          shippingPartners: [
            {
              title: "میاره",
              name: "miare",
              image: miarePartner?.imageFile
                ? publicUrl(miarePartner.imageFile.key)
                : "",
              price: miare.price,
              shippingPartnerId: miarePartner?.id || 1,
            },
          ],
        });
      }
    }
    try {
      const podro = await podroShippingPrices({ orderId: order.id, prisma });

      if (podro?.shipping) {
        const podro_shippings = {
          shippingTypeName: "شرکت های پستی",
          shippingPartners: podro.shipping.map((sh: any) => ({
            title: sh.title,
            name: sh.name,
            image: sh.logo,
            price: sh.price,
            shippingPartnerId: sh.id,
          })),
        };

        shippings.push(podro_shippings);
      }
    } catch (error) {
      console.log(error);
    }

    return { shippings, error: null };
  } catch (error) {
    return { shippings: null, error };
  }
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
