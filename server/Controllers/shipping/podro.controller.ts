import axios from "axios";
import z from "zod";
import { ArgsStructure } from "../category.controller";
import { headers } from "next/headers";
import { PrismaClient } from "@/generated/prisma/client";
import { TRPCError } from "@trpc/server";
const PODRO_BASE_URL = "https://portal.podro.com/napi/logistics";
const PODRO_HEADER = {
  headers: { Authorization: `Bearer ${process.env.PODRO_TOKEN}` },
};

async function createCustomer() {
  try {
    const body = {
      name: "",
      first_name: "عباس",
      last_name: "رضائی",
      phone: "09038338886",
      postal_code: "1111111111",
      city_code: "3001",
      address: "سیبیب",
      unit: "",
      plate: "111",
      default: false,
    };

    const response = await axios.post(
      `${PODRO_BASE_URL}/addressbooks/receiver`,
      body,
      PODRO_HEADER
    );

    // sample response
    // {
    //     "code": 0,
    //     "message": "",
    //     "data": {
    //       "addressbook": {
    //         "id": 16088,
    //         "first_name": "عباس",
    //         "last_name": "رضائی",
    //         "phone": "09038338886",
    //         "name": null,
    //         "address": "سیبیب",
    //         "city": null,
    //         "postal_code": "1111111111",
    //         "plate": "111",
    //         "unit": null,
    //         "default": null,
    //         "latitude": null,
    //         "longitude": null,
    //         "shop": null,
    //         "type": "receiver",
    //         "gateway": null,
    //         "national_code": null
    //       }
    //     }
    //   }
  } catch (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "while creating podro customer",
    });
  }
}

async function podroDrafts() {
  try {
    const drafts: number[] = [];
    const response = await axios.get(`${PODRO_BASE_URL}/drafts`, PODRO_HEADER);
    response.data.data.elements.map((draft: any) => {
      if (draft.status === "DRAFT") {
        drafts.push(draft.id);
      }
    });

    return { drafts, error: null };
  } catch (error) {
    return { drafts: null, error };
  }
}

async function removeDraft({ draftIds }: { draftIds: number[] }) {
  try {
    const response = await axios.delete(
      `${PODRO_BASE_URL}/drafts?ids=${draftIds.join(",")}`,
      PODRO_HEADER
    );
    if (response.status === 204) {
      return { isDeleted: true, error: null };
    } else {
      return { isDeleted: false, error: null };
    }
  } catch (error) {
    return { isDeleted: false, error };
  }
}

async function createDraft({
  prisma,
  orderId,
}: {
  prisma: PrismaClient;
  orderId: number;
}) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        Address: {
          include: {
            Province: true,
            city: true,
          },
        },
      },
    });

    const body = {
      origin: "PANEL",
      sender_id: 16076,
      items: [
        {
          receiver: {
            first_name: order?.Address?.reciverName || "",
            last_name: order?.Address?.reciverFamilyName || "",
            phone_number: order?.Address?.reciverPhoneNumber,
            national_code: "",
            postal_code: order?.Address?.postalCode?.toString(),
            province_id: order?.Address?.Province.id,
            city_code: order?.Address?.city.podroCode || "",
            address: order?.Address?.addressDetails || "",
            plate: "111",
            unit: "",
          },
          parcel: {
            // NEED TO EDIT
            box_size_id: "cc2a21c3-c68b-4211-84bc-0175ab1faa69",
            content_id: 11,
            value: order?.finalPrice || 0,
            // ALSO HERE
            weight: 500,
          },
        },
      ],
    };

    try {
      // clear all past drafts that doesn't send
      await podroDrafts().then((e) => {
        if (e.drafts) removeDraft({ draftIds: e.drafts }).then;
      });


      try {

        const response = await axios.post(
          `${PODRO_BASE_URL}/drafts`,
          body,
          PODRO_HEADER
        );


        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: { podroRequestId: response.data.data.request_id },
        });

        return { error: null, requestId: response.data.data.request_id };
      } catch (error) {
        console.log(error)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
      }
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
    }
  } catch (error) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
  }
}

/// sample response
// {
//     "code": 0,
//     "message": "",
//     "data": {
//       "request_id": "0bd1dabd-447c-48cf-bc1f-2850a5027471",
//       "rejected_items": null
//     }
//   }

export async function podroShippingPrices({
  prisma,
  orderId,
}: {
  prisma: PrismaClient;
  orderId: number;
}) {
  try {
    // const order = await prisma.order.findUnique({
    //   where: { id: orderId },
    // });
    // if (order?.podroRequestId) {
    //   const body = {
    //     request_id: order.podroRequestId,
    //   };
    //   const response = await axios.post(
    //     `${PODRO_BASE_URL}/shippings/enquiry`,
    //     body,
    //     PODRO_HEADER
    //   );
    //   const shipping = response.data.data.shippings.map((sh: any) => ({
    //     id: sh.id,
    //     title: sh.provider.title,
    //     name: sh.provider.name,
    //     logo: sh.provider.logo,
    //     price: sh.pickup_fee / 10,
    //   }));
    //   return { shipping, error: null };
    // }
    const { requestId } = await createDraft({
      prisma: prisma,
      orderId: orderId,
    });

    if (requestId) {
      const body = {
        request_id: requestId,
      };


      const response = await axios.post(
        `${PODRO_BASE_URL}/shippings/enquiry`,
        body,
        PODRO_HEADER
      );

      const shipping = response.data.data.shippings.map((sh: any) => ({
        id: sh.id,
        title: sh.provider.title,
        name: sh.provider.name,
        logo: sh.provider.logo,
        price: (sh.net_price / 10).toFixed(0),
      }));

      return { shipping, error: null };
    }
  } catch (error) {
    return { shipping: null, error };
  }
}

// sample response
const shippingPricesSampleResponse = {
  code: 0,
  message: "",
  data: {
    group_id: "668e9a5fd86a16eca9d77ddf",
    count: 1,
    address_name: "شعبه تجریش",
    shippings: [
      {
        id: "668e9a60d86a16eca9d77de1",
        provider: {
          title: "شرکت ملی پست (پیشتاز)",
          name: "post",
          service_type: "regular",
          logo: "https://portal.podro.com/logos/postLogo.png",
          rate: "4.05",
        },
        count: 1,
        unhandled: 0,
        net_price: 352000,
        payable_price: 752000,
        pickup_fee: 400000,
      },
      {
        id: "668e9a60d86a16eca9d77de6",
        provider: {
          title: "ماهکس",
          name: "mahex",
          service_type: "regular",
          logo: "https://portal.podro.com/logos/mahexLogo.png",
          rate: "3.71",
        },
        count: 1,
        unhandled: 0,
        net_price: 709600,
        payable_price: 709600,
        pickup_fee: 0,
      },
    ],
  },
};
