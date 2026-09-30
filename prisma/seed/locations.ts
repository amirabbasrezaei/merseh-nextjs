import citiesJson from "../../public/gistfile1.json";
import type { SeedPrisma } from "./types";

type CityJson = {
  id: number;
  name: string;
  code: string;
};

type ProvinceJson = {
  id: number;
  name: string;
  cities: CityJson[];
};

const PROVINCE_ENGLISH: Record<string, string> = {
  "آذربایجان شرقی": "East Azerbaijan",
  "آذربایجان غربی": "West Azerbaijan",
  اردبیل: "Ardabil",
  اصفهان: "Isfahan",
  البرز: "Alborz",
  ایلام: "Ilam",
  بوشهر: "Bushehr",
  تهران: "Tehran",
  "چهارمحال و بختیاری": "Chaharmahal and Bakhtiari",
  "خراسان جنوبی": "South Khorasan",
  "خراسان رضوی": "Razavi Khorasan",
  "خراسان شمالی": "North Khorasan",
  خوزستان: "Khuzestan",
  زنجان: "Zanjan",
  سمنان: "Semnan",
  "سیستان و بلوچستان": "Sistan and Baluchestan",
  فارس: "Fars",
  قزوین: "Qazvin",
  قم: "Qom",
  کردستان: "Kurdistan",
  کرمان: "Kerman",
  کرمانشاه: "Kermanshah",
  "کهگیلویه و بویراحمد": "Kohgiluyeh and Boyer-Ahmad",
  گلستان: "Golestan",
  گیلان: "Gilan",
  لرستان: "Lorestan",
  مازندران: "Mazandaran",
  مرکزی: "Markazi",
  هرمزگان: "Hormozgan",
  همدان: "Hamadan",
  یزد: "Yazd",
};

export async function seedLocations(prisma: SeedPrisma) {
  const provinces = citiesJson as ProvinceJson[];
  let cityCount = 0;

  for (const province of provinces) {
    const created = await prisma.province.create({
      data: {
        name: province.name,
        engName: PROVINCE_ENGLISH[province.name] ?? "",
      },
    });

    if (province.cities.length) {
      await prisma.city.createMany({
        data: province.cities.map((city) => ({
          name: city.name,
          engName: "",
          provinceId: created.id,
          podroCode: city.code,
        })),
      });
      cityCount += province.cities.length;
    }
  }

  console.log(
    `Seeded ${provinces.length} provinces and ${cityCount} cities`
  );
}
