import { z } from "zod";
import { estimate_miare_price } from "./shipping/miare.controller";
import { ArgsStructure } from "./category.controller";
import CitiesJson from "./../../public/gistfile1.json";
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
        result: null,
        error: null,
        message: "need to add address",
        needToAddAddress: true,
      };
    }

    await prisma.order.update({
      where: {
        id: input.orderId,
      },
      data: {
        addressId: input.addressId,
      },
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
    const miare = await estimate_miare_price(coordinateBody);

    const result = [
      {
        shippingTypeName: "پیک موتوری",
        shippingPartners: [
          {
            name: "میاره",
            image: "https://merseh.storage.iran.liara.space/main_images/miare-logo.svg",
            price: miare.price,
            shippingPartnerId: 1,
          },
        ],
      },
    ];

    return { result };
  } catch (error) {
    return { result: null, error };
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
    name: z.string(),
    familyName: z.string(),
  }),
  phoneNumber: z.string(),
  provinceId: z.number(),
  cityId: z.number(),
  detailedAddress: z.string(),
  postalCode: z.number(),
});

type AddAddressInput = z.infer<typeof AddAddressInputSchema>;

export async function addAddressController({
  ctx,
  input,
}: ArgsStructure<AddAddressInput>) {
  const { prisma, user } = ctx;
  try {
    await prisma.address.create({
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

    return { status: "ok", error: null };
  } catch (error) {
    console.log(error);
    return { status: "failed", error };
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
        name: province.province,
      },
    });

    for (let city of province.cities) {
      await ctx.prisma.city.create({
        data: {
          engName: "",
          name: city,
          provinceId: createdPr.id,
        },
      });
    }
  }
}
