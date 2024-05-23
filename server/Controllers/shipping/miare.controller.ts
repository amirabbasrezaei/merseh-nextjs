import { z } from "zod";
import { ArgsStructure } from "../category.controller";
import axios from "axios";

const BASE_URL = "https://www.miare.ir/api/";

const EstimateMirarePriceInputSchema = z.object({
  origin: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  destination: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

const HEADERS = {
  headers: { Authorization: `Token ${process.env.MIARE_TOKEN}` },
};

type EstimateMirarePriceInput = z.infer<typeof EstimateMirarePriceInputSchema>;
export async function estimate_miare_price(input: EstimateMirarePriceInput) {
  const { origin, destination } = input;
  if (origin) {
    const response = await axios.get(
      `${BASE_URL}accounting/estimate/price?source=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`,
      HEADERS
    );
    return response.data;
  }
  throw new Error("no coordinate")
}
