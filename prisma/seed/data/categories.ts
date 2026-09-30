import type { SeedCategory } from "../types";
import type { ImageKey } from "./images";

type CategorySeed = Omit<SeedCategory, "imageKey"> & { imageKey: ImageKey };

export const categories: CategorySeed[] = [
  {
    slug: "merseh-root",
    title: "محصولات مرسه",
    englishTitle: "Merseh Products",
    parentSlug: null,
    imageKey: "spaTowels",
    metaDescription:
      "فروشگاه مرسه؛ روغن گیاهی، مراقبت پوست و مو، ضدآفتاب و لوازم آرایش با فرمولاسیون شفاف و مواد اولیه مشخص.",
    paragraphs: [
      "مرسه مجموعه‌ای از محصولات مراقبتی را با تمرکز روی روغن‌های گیاهی، بافت سبک و برچسب ترکیبات خوانا عرضه می‌کند.",
      "دسته‌بندی‌ها طوری چیده شده‌اند که مسیر خرید از روغن صورت تا ضدآفتاب روزانه مشخص باشد.",
    ],
  },
  {
    slug: "herbal-oils",
    title: "روغن‌های گیاهی",
    englishTitle: "Herbal Oils",
    parentSlug: "merseh-root",
    imageKey: "oilAmber",
    metaDescription:
      "خرید روغن آرگان، جوجوبا، بادام و رزماری مرسه؛ روغن‌های گیاهی سردفشرده برای صورت، مو و بدن.",
    paragraphs: [
      "روغن‌های گیاهی مرسه برای ماساژ صورت، درخشش مو و مراقبت بدن انتخاب شده‌اند و بیشتر به‌صورت سردفشرده پر می‌شوند.",
      "حجم‌های ۳۰، ۵۰ و ۱۰۰ میلی‌لیتر برای مصرف روزانه و هدیه موجود است.",
    ],
  },
  {
    slug: "skin-care",
    title: "مراقبت پوست",
    englishTitle: "Skin Care",
    parentSlug: "merseh-root",
    imageKey: "creamJar",
    metaDescription:
      "مرطوب‌کننده هیالورونیک، سرم ویتامین C و نیاسینامید، کرم شب و مراقبت دور چشم از مرسه.",
    paragraphs: [
      "خط مراقبت پوست مرسه روی آبرسانی، یکنواختی رنگ و سد دفاعی پوست تمرکز دارد.",
      "محصولات بدون ادعاهای پزشکی نوشته شده‌اند و مناسب روتین خانگی روز و شب هستند.",
    ],
  },
  {
    slug: "hair-care",
    title: "مراقبت مو",
    englishTitle: "Hair Care",
    parentSlug: "merseh-root",
    imageKey: "hairSalon",
    metaDescription:
      "شامپو رزماری، نرم‌کننده آرگان، ماسک کراتین و سرم نوک مو مرسه برای موهای خشک و آسیب‌دیده.",
    paragraphs: [
      "مراقبت مو در مرسه از شست‌وشوی ملایم تا روغن‌رسانی نوک تار طراحی شده است.",
      "فرمولاسیون‌ها برای استفاده مکرر در آب‌وهوای خشک ایران تنظیم شده‌اند.",
    ],
  },
  {
    slug: "cleanser-toner",
    title: "پاک‌کننده و تونر",
    englishTitle: "Cleanser and Toner",
    parentSlug: "merseh-root",
    imageKey: "cleanser",
    metaDescription:
      "ژل شستشو، میسلار واتر، تونر گل رز و لایه‌بردار AHA مرسه برای پاکسازی بدون کشیدگی پوست.",
    paragraphs: [
      "پاک‌کننده‌ها نقطه شروع روتین هستند؛ بافت‌ها از میسلار تا فوم برای پوست خشک تا چرب انتخاب شده‌اند.",
      "تونر و لایه‌بردار بعد از شستشو برای تعادل pH و روشن‌تر دیده‌شدن پوست استفاده می‌شوند.",
    ],
  },
  {
    slug: "dried-herbs",
    title: "گیاهان خشک",
    englishTitle: "Dried Herbs",
    parentSlug: "merseh-root",
    imageKey: "herbsLavender",
    metaDescription:
      "بابونه، گل‌گاوزبان و اسطوخودوس خشک مرسه برای دمنوش و ماسک گیاهی خانگی.",
    paragraphs: [
      "گیاهان خشک مرسه برای دمنوش عصرگاهی و کمپرس آرام‌بخش صورت بسته‌بندی می‌شوند.",
      "هر بسته تاریخ برداشت و روش دم‌کردن روی برچسب دارد.",
    ],
  },
  {
    slug: "body-care",
    title: "مراقبت بدن",
    englishTitle: "Body Care",
    parentSlug: "merseh-root",
    imageKey: "bodyLotion",
    metaDescription:
      "لوسیون شی‌باتر، اسکراب قهوه، روغن بدن آرگان و کرم دست گلیسیرین مرسه.",
    paragraphs: [
      "مراقبت بدن مرسه برای پوست خشک دست و ساق پا، بعد از حمام و هوای سرد طراحی شده است.",
      "بافت‌ها از اسکراب دانه‌ریز تا لوسیون زودجذب متنوع‌اند.",
    ],
  },
  {
    slug: "makeup",
    title: "آرایش",
    englishTitle: "Makeup",
    parentSlug: "merseh-root",
    imageKey: "makeupPalette",
    metaDescription:
      "ریمل حجم‌دهنده، تینت لب و کرم‌پودر سبک مرسه برای آرایش روزمره.",
    paragraphs: [
      "خط آرایش مرسه کوتاه و کاربردی است؛ محصولاتی که با پوست مراقبت‌شده سازگار بمانند.",
      "رنگ‌ها برای تناژ گرم پوست رایج در ایران انتخاب شده‌اند.",
    ],
  },
  {
    slug: "sunscreen",
    title: "ضدآفتاب",
    englishTitle: "Sunscreen",
    parentSlug: "merseh-root",
    imageKey: "beachSkin",
    metaDescription:
      "ضدآفتاب فلوئید SPF50، ضدآفتاب رنگی SPF30 و ضدآفتاب ملایم مرسه برای استفاده روزانه.",
    paragraphs: [
      "ضدآفتاب‌های مرسه برای هوای آفتابی و آلودگی شهری با بافت غیرچرب پر می‌شوند.",
      "استفاده هر دو ساعت در فضای باز روی برچسب یادآوری شده است.",
    ],
  },
  {
    slug: "face-oils",
    title: "روغن صورت",
    englishTitle: "Face Oils",
    parentSlug: "herbal-oils",
    imageKey: "oilDropper",
    metaDescription:
      "روغن آرگان، جوجوبا، بادام شیرین و گل رز مرسه برای ماساژ شبانه صورت.",
    paragraphs: [
      "روغن صورت را روی پوست کمی مرطوب بزنید تا بهتر پخش شود و براقیت سنگین نماند.",
    ],
  },
  {
    slug: "hair-body-oils",
    title: "روغن مو و بدن",
    englishTitle: "Hair and Body Oils",
    parentSlug: "herbal-oils",
    imageKey: "oilCoconut",
    metaDescription:
      "روغن نارگیل، رزماری، سیاه‌دانه و زیتون مرسه برای مو و ماساژ بدن.",
    paragraphs: [
      "این روغن‌ها برای طول تار مو، کف سر و بدن مناسب‌اند و قبل از شستشو یا بعد از حمام استفاده می‌شوند.",
    ],
  },
  {
    slug: "moisturizers",
    title: "مرطوب‌کننده",
    englishTitle: "Moisturizers",
    parentSlug: "skin-care",
    imageKey: "creamWhite",
    metaDescription:
      "کرم هیالورونیک و کرم سرامید مرسه برای آبرسانی روز و ترمیم سد پوست.",
    paragraphs: [
      "مرطوب‌کننده‌ها بعد از سرم و قبل از ضدآفتاب در روتین صبح قرار می‌گیرند.",
    ],
  },
  {
    slug: "serums",
    title: "سرم",
    englishTitle: "Serums",
    parentSlug: "skin-care",
    imageKey: "serumGlass",
    metaDescription:
      "سرم ویتامین C و نیاسینامید مرسه برای روشن‌تر دیده‌شدن و کنترل چربی.",
    paragraphs: [
      "سرم را روی پوست تمیز بزنید و چند دقیقه صبر کنید تا جذب شود.",
    ],
  },
  {
    slug: "eye-lip",
    title: "مراقبت چشم و لب",
    englishTitle: "Eye and Lip Care",
    parentSlug: "skin-care",
    imageKey: "eyeCream",
    metaDescription:
      "کرم دور چشم کافئین، کرم شب رتینول و بالم لب مرسه.",
    paragraphs: [
      "پوست نازک دور چشم و لب به بافت سبک‌تر و تکرار منظم نیاز دارد.",
    ],
  },
  {
    slug: "shampoo-conditioner",
    title: "شامپو و نرم‌کننده",
    englishTitle: "Shampoo and Conditioner",
    parentSlug: "hair-care",
    imageKey: "shampoo",
    metaDescription:
      "شامپو رزماری، شامپو ضدشوره و نرم‌کننده آرگان مرسه.",
    paragraphs: [
      "شامپو را روی کف سر و نرم‌کننده را از میانه تا نوک مو پخش کنید.",
    ],
  },
  {
    slug: "hair-mask-serum",
    title: "ماسک و سرم مو",
    englishTitle: "Hair Mask and Serum",
    parentSlug: "hair-care",
    imageKey: "hairOil",
    metaDescription:
      "ماسک کراتین، روغن مو آرگان و سرم نوک مو مرسه.",
    paragraphs: [
      "ماسک هفته‌ای یک تا دو بار و سرم نوک مو هر روز بعد از خشک‌کردن استفاده می‌شود.",
    ],
  },
  {
    slug: "face-wash",
    title: "شوینده صورت",
    englishTitle: "Face Wash",
    parentSlug: "cleanser-toner",
    imageKey: "foamWash",
    metaDescription:
      "ژل نیاسینامید، فوم پوست چرب و میسلار واتر مرسه.",
    paragraphs: [
      "شوینده را با آب ولرم بشویید و از مالش شدید با حوله پرهیز کنید.",
    ],
  },
  {
    slug: "toner-exfoliant",
    title: "تونر و لایه‌بردار",
    englishTitle: "Toner and Exfoliant",
    parentSlug: "cleanser-toner",
    imageKey: "toner",
    metaDescription:
      "تونر گل رز و لایه‌بردار AHA/BHA مرسه برای صاف‌تر دیده‌شدن پوست.",
    paragraphs: [
      "لایه‌بردار شیمیایی را شب و نه هم‌زمان با رتینول قوی استفاده کنید.",
    ],
  },
  {
    slug: "herbal-tea",
    title: "دمنوش و گیاه",
    englishTitle: "Herbal Infusions",
    parentSlug: "dried-herbs",
    imageKey: "herbsDried",
    metaDescription:
      "بابونه، گل‌گاوزبان و اسطوخودوس خشک مرسه برای دمنوش.",
    paragraphs: [
      "گیاه را با آب جوش دم کنید و برای ماسک، جوشانده خنک‌شده را روی پارچه بریزید.",
    ],
  },
  {
    slug: "body-lotion-oil",
    title: "لوسیون و روغن بدن",
    englishTitle: "Body Lotion and Oil",
    parentSlug: "body-care",
    imageKey: "oilBottles",
    metaDescription:
      "لوسیون شی‌باتر و روغن بدن آرگان مرسه.",
    paragraphs: [
      "بعد از حمام روی پوست نمدار بزنید تا لایه رطوبت بهتر بماند.",
    ],
  },
  {
    slug: "body-scrub-hands",
    title: "اسکراب و کرم دست",
    englishTitle: "Scrub and Hand Cream",
    parentSlug: "body-care",
    imageKey: "creamSpa",
    metaDescription:
      "اسکراب بدن قهوه و کرم دست گلیسیرین مرسه.",
    paragraphs: [
      "اسکراب را روی پوست خیس دایره‌ای ماساژ دهید و کرم دست را بعد از هر شستشو تکرار کنید.",
    ],
  },
  {
    slug: "makeup-lip-eye",
    title: "لب و چشم",
    englishTitle: "Lip and Eye Makeup",
    parentSlug: "makeup",
    imageKey: "lipstick",
    metaDescription:
      "ریمل حجم‌دهنده و تینت لب مرسه.",
    paragraphs: [
      "ریمل را از ریشه مژه بکشید و تینت را با انگشت روی لب پخش کنید.",
    ],
  },
  {
    slug: "makeup-face",
    title: "آرایش صورت",
    englishTitle: "Face Makeup",
    parentSlug: "makeup",
    imageKey: "makeupBrushes",
    metaDescription:
      "کرم‌پودر سبک مرسه برای پوشش طبیعی روز.",
    paragraphs: [
      "کرم‌پودر را بعد از مرطوب‌کننده و ضدآفتاب با اسفنج مرطوب پخش کنید.",
    ],
  },
  {
    slug: "face-sunscreen",
    title: "ضدآفتاب صورت",
    englishTitle: "Face Sunscreen",
    parentSlug: "sunscreen",
    imageKey: "sunscreen",
    metaDescription:
      "فلوئید SPF50 و ضدآفتاب رنگی SPF30 مرسه.",
    paragraphs: [
      "دو بند انگشت برای صورت و گردن کافی است؛ در فضای باز تمدید کنید.",
    ],
  },
];
