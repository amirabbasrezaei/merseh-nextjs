import bcrypt from "bcryptjs";
import { addressSeeds, customers } from "./data/people";
import type { CatalogResult, EditorialResult, SeedPrisma } from "./types";

async function requireCity(
  prisma: SeedPrisma,
  provinceName: string,
  cityName: string
) {
  const province = await prisma.province.findFirst({
    where: { name: provinceName },
  });
  if (!province) {
    throw new Error(`Province not found: ${provinceName}`);
  }

  const city = await prisma.city.findFirst({
    where: { name: cityName, provinceId: province.id },
  });
  if (!city) {
    throw new Error(`City not found: ${cityName} in ${provinceName}`);
  }

  return { province, city };
}

export async function seedCommerce(
  prisma: SeedPrisma,
  catalog: CatalogResult,
  editorial: EditorialResult
) {
  const adminPhone = process.env.ADMIN_PHONE?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPhone || !adminPassword) {
    throw new Error("ADMIN_PHONE and ADMIN_PASSWORD are required");
  }

  const userPassword = process.env.SEED_USER_PASSWORD || "Merseh1234";
  const hashedUserPassword = await bcrypt.hash(userPassword, 12);
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.create({
    data: {
      phoneNumber: adminPhone,
      name: "Admin",
      familyName: "Merseh",
      password: hashedAdminPassword,
      role: "ADMIN",
      isVerified: true,
      credit: Number(process.env.INITIAL_CREDIT ?? 0),
      email: "admin@merseh.local",
    },
  });

  const usersByPhone = new Map<string, string>([[admin.phoneNumber, admin.id]]);

  for (const customer of customers) {
    if (customer.phone === adminPhone) {
      continue;
    }
    const created = await prisma.user.create({
      data: {
        name: customer.name,
        familyName: customer.familyName,
        phoneNumber: customer.phone,
        email: customer.email,
        password: hashedUserPassword,
        role: "USER",
        isVerified: true,
        credit: 150000,
        numberOfLogins: 3,
      },
    });
    usersByPhone.set(customer.phone, created.id);
  }

  console.log(`Seeded ${usersByPhone.size} users`);

  const addressesByPhone = new Map<string, string>();

  for (const seed of addressSeeds) {
    const userId = usersByPhone.get(seed.userPhone);
    if (!userId) {
      throw new Error(`User missing for address ${seed.userPhone}`);
    }
    const { province, city } = await requireCity(
      prisma,
      seed.provinceName,
      seed.cityName
    );
    const created = await prisma.address.create({
      data: {
        title: seed.title,
        latitude: seed.latitude,
        longitude: seed.longitude,
        cityId: city.id,
        provinceId: province.id,
        userId,
        postalCode: seed.postalCode,
        addressDetails: seed.addressDetails,
        reciverPhoneNumber: seed.reciverPhoneNumber,
        reciverName: seed.reciverName,
        reciverFamilyName: seed.reciverFamilyName,
      },
    });
    addressesByPhone.set(seed.userPhone, created.id);
  }

  const post = editorial.shippingByName.get("پست پیشتاز");
  const tipax = editorial.shippingByName.get("تیپاکس");
  const podro = editorial.shippingByName.get("پادرو");
  if (!post || !tipax || !podro) {
    throw new Error("Shipping partners missing");
  }

  const picked = [...catalog.productsByEngName.values()];
  if (picked.length < 7) {
    throw new Error("Required products missing for orders");
  }

  const [argan, cream, spf, shampoo, toner, mascara, jojoba] = picked;
  const rosemary = picked[7] ?? argan;

  await prisma.product.update({
    where: { id: jojoba.id },
    data: { freeShipping: true },
  });

  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", type: "PERCENT", value: 10 },
      { code: "FREESHIP", type: "FREE_SHIPPING", value: 0 },
      {
        code: "SAVE50",
        type: "FIXED",
        value: 50000,
        minSubtotal: 500000,
      },
    ],
  });
  console.log("Seeded 3 coupons");

  const priced = await prisma.product.findMany({
    where: {
      id: { in: [...new Set(picked.slice(0, 8).map((product) => product.id))] },
    },
    select: { id: true, price: true, discount: true },
  });
  const netById = new Map(
    priced.map((product) => [product.id, product.price - product.discount])
  );
  const net = (product: { id: number }) => {
    const value = netById.get(product.id);
    if (value === undefined) {
      throw new Error(`Product ${product.id} missing for order pricing`);
    }
    return value;
  };

  const sara = usersByPhone.get("09121112201")!;
  const niloofar = usersByPhone.get("09121112202")!;
  const mahsa = usersByPhone.get("09121112203")!;
  const armin = usersByPhone.get("09121112204")!;
  const parisa = usersByPhone.get("09121112205")!;
  const kian = usersByPhone.get("09121112206")!;

  const deliveredPrice = net(argan) + net(cream) + 35000;
  const payedPrice = net(spf) + 45000;
  const deliveringPrice = net(shampoo) + net(toner) + 55000;
  const activePrice = net(mascara) + net(jojoba) + 35000;

  const delivered = await prisma.order.create({
    data: {
      status: "DELIVERED",
      userId: sara,
      addressId: addressesByPhone.get("09121112201"),
      shippingPartnerId: post,
      finalPrice: deliveredPrice,
      createdAt: new Date("2026-04-08T11:20:00.000Z"),
      OrderShipping: {
        create: {
          price: 35000,
          shippingPartnerId: post,
          name: "pishtaz",
          title: "پست پیشتاز",
        },
      },
      ProductForOrder: {
        create: [
          {
            numberOfproduct: 1,
            productId: argan.id,
            productVariationId: argan.variation?.id,
            productVariationValueId: argan.variation?.valueId,
          },
          {
            numberOfproduct: 1,
            productId: cream.id,
          },
        ],
      },
      Payment: {
        create: {
          userId: sara,
          trackId: "seed-track-delivered-001",
          status: 1,
          isPayed: true,
          servicePaymentId: "seed-zibal-001",
          value: deliveredPrice,
          cardNumber: "603799******1234",
          paymentDescription: "خرید روغن آرگان و کرم هیالورونیک",
          payment_success_date: new Date("2026-04-08T11:22:00.000Z"),
        },
      },
    },
  });

  const payed = await prisma.order.create({
    data: {
      status: "PAYED",
      userId: niloofar,
      addressId: addressesByPhone.get("09121112202"),
      shippingPartnerId: tipax,
      finalPrice: payedPrice,
      createdAt: new Date("2026-05-19T15:05:00.000Z"),
      OrderShipping: {
        create: {
          price: 45000,
          shippingPartnerId: tipax,
          name: "tipax",
          title: "تیپاکس",
        },
      },
      ProductForOrder: {
        create: [{ numberOfproduct: 1, productId: spf.id }],
      },
      Payment: {
        create: {
          userId: niloofar,
          trackId: "seed-track-payed-002",
          status: 1,
          isPayed: true,
          servicePaymentId: "seed-zibal-002",
          value: payedPrice,
          cardNumber: "627412******8890",
          paymentDescription: "خرید ضدآفتاب فلوئید SPF50",
          payment_success_date: new Date("2026-05-19T15:07:00.000Z"),
        },
      },
    },
  });

  const delivering = await prisma.order.create({
    data: {
      status: "DELIVERING",
      userId: mahsa,
      addressId: addressesByPhone.get("09121112203"),
      shippingPartnerId: podro,
      finalPrice: deliveringPrice,
      createdAt: new Date("2026-06-02T09:40:00.000Z"),
      podroRequestId: "seed-podro-req-17",
      OrderShipping: {
        create: {
          price: 55000,
          shippingPartnerId: podro,
          name: "podro",
          title: "پادرو",
        },
      },
      ProductForOrder: {
        create: [
          {
            numberOfproduct: 1,
            productId: shampoo.id,
            productVariationId: shampoo.variation?.id,
            productVariationValueId: shampoo.variation?.valueId,
          },
          { numberOfproduct: 1, productId: toner.id },
        ],
      },
      Payment: {
        create: {
          userId: mahsa,
          trackId: "seed-track-delivering-003",
          status: 1,
          isPayed: true,
          servicePaymentId: "seed-zibal-003",
          value: deliveringPrice,
          cardNumber: "610433******4411",
          paymentDescription: "شامپو رزماری و تونر گل رز",
          payment_success_date: new Date("2026-06-02T09:41:00.000Z"),
        },
      },
    },
  });

  const active = await prisma.order.create({
    data: {
      status: "ACTIVE",
      userId: armin,
      addressId: addressesByPhone.get("09121112204"),
      shippingPartnerId: post,
      finalPrice: activePrice,
      createdAt: new Date("2026-06-10T18:12:00.000Z"),
      OrderShipping: {
        create: {
          price: 35000,
          shippingPartnerId: post,
          name: "pishtaz",
          title: "پست پیشتاز",
        },
      },
      ProductForOrder: {
        create: [
          { numberOfproduct: 1, productId: mascara.id },
          {
            numberOfproduct: 1,
            productId: jojoba.id,
            productVariationId: jojoba.variation?.id,
            productVariationValueId: jojoba.variation?.valueId,
          },
        ],
      },
    },
  });

  console.log(
    `Seeded orders ${delivered.id}, ${payed.id}, ${delivering.id}, ${active.id}`
  );

  const oilGuideId = editorial.articlesByEnglishTitle.get(
    "Herbal Oil Guide Argan Jojoba Grapeseed"
  );
  const sunscreenArticleId = editorial.articlesByEnglishTitle.get(
    "Daily Sunscreen Amount SPF30 vs SPF50"
  );
  if (!oilGuideId || !sunscreenArticleId) {
    throw new Error("Articles missing for comments");
  }

  const parentReview = await prisma.comment.create({
    data: {
      content:
        "روغن آرگان را شب‌ها بعد از کرم هیالورونیک می‌زنم. بوی تند ندارد و روی گونه خشکم تا صبح نمی‌کشد. حجم ۳۰ میلی‌لیتر حدود دو ماه برای صورت کافی بود.",
      status: "APPROVED",
      userId: sara,
      productId: argan.id,
      likes: { connect: [{ id: niloofar }, { id: mahsa }] },
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "اگر زیر آرایش می‌زنید سه دقیقه صبر کنید؛ وگرنه کرم‌پودر روی بینی‌ام لیز می‌شد.",
      status: "APPROVED",
      userId: parisa,
      productId: argan.id,
      parent_comment_id: parentReview.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "فلوئید SPF50 زیر آرایش سبک می‌ماند و سفیدک کمی دارد. تمدید ظهر را فراموش نکنید.",
      status: "APPROVED",
      userId: niloofar,
      productId: spf.id,
      likes: { connect: [{ id: sara }] },
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "شامپو رزماری کف سر چربم را دو روز تمیز نگه می‌دارد. طول مو را با نرم‌کننده آرگان جمع می‌کنم.",
      status: "APPROVED",
      userId: mahsa,
      productId: shampoo.id,
    },
  });

  await prisma.comment.create({
    data: {
      content:
        "بسته روغن رزماری من نشتی داشت، لطفاً بررسی کنید.",
      status: "NEED_REVIEW",
      userId: kian,
      productId: rosemary.id,
    },
  });

  const articleParent = await prisma.comment.create({
    data: {
      content:
        "راهنمای روغن‌ها دقیق بود. از نارگیل روی صورتم زده بودم و جوش بسته بود؛ جوجوبا پیشنهاد بهتری است.",
      status: "APPROVED",
      userId: armin,
      articleId: oilGuideId,
      likes: { connect: [{ id: sara }] },
    },
  });

  await prisma.comment.create({
    data: {
      content: "پس از دو هفته جوجوبا، تی‌زونم کمتر براق است.",
      status: "APPROVED",
      userId: sara,
      articleId: oilGuideId,
      parent_comment_id: articleParent.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "کاش جدول مقدار ضدآفتاب برای گردن هم جدا نوشته شود.",
      status: "NEED_REVIEW",
      userId: parisa,
      articleId: sunscreenArticleId,
    },
  });

  console.log("Seeded product and article comments");
}
