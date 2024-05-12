import { z } from "zod";
import { estimate_miare_price } from "./shipping/miare.controller";
import { ArgsStructure } from "./category.controller";

export const ShippingPricesInputSchema = z.object({
  addressId: z.string(),
});

type ShippingPricesInput = z.infer<typeof ShippingPricesInputSchema>;
export async function getShippingPricesController({
  ctx,
  input,
}: ArgsStructure<ShippingPricesInput>) {
  const { prisma, user } = ctx;
  const userId = "a6db23d5-b815-4bdd-bc0c-756067eb4ebe";
  try {
    const address = await prisma.address.findUnique({
      where: {
        id: input.addressId,
        User: {
          id: userId,
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

    const coordinateBody = {
      origin: {
        latitude: Number(process.env.STORE_LATITUDE) as number,
        longitude: Number(process.env.STORE_LONGITUDE) as number,
      },
      destination: {
        latitude: address.coordinate[0],
        longitude: address.coordinate[1],
      },
    };
    const miare = await estimate_miare_price(coordinateBody);

    const result = {
      bike_deliveery: {
        miare: {
          price: miare.price,
        },
      },
    };

    return { result };
  } catch (error) {
    return { result: null, error };
  }
}
