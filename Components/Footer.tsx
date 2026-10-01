import Link from "next/link";
import BrandWordmark from "./Brand/BrandWordmark";
import { SITE_NAME } from "@/utils/site";
import {
  Instagram_SVG,
  Location_Pin,
  Phone_SVG,
  Telegram_SVG,
} from "./SVGS";

type FooterLink = {
  label: string;
  href: string;
};

const FOOTER_LINKS: { title: string; links: FooterLink[] }[] = [
  {
    title: "فروشگاه",
    links: [
      { label: "محصولات", href: "/products" },
      { label: "برندها", href: "/brands" },
      { label: "دسته‌بندی‌ها", href: "/mcategory" },
    ],
  },
  {
    title: SITE_NAME,
    links: [{ label: `مجله ${SITE_NAME}`, href: "/mag" }],
  },
];

const ADDRESSES = [
  "تهران، میدان تجریش، خیابان دربندی، پلاک ۱۱۸",
  "استان مرکزی، شهر محلات، خیابان شهید قندی، جنب امامزاده فضل و یحیی",
];

export default function Footer() {
  return (
    <footer className="w-full rounded-t-panel bg-plum-900 px-6 py-12 text-ivory md:px-10 md:py-16">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-start gap-4">
          <BrandWordmark className="text-[32px] text-ivory" />
          <p className="max-w-xs text-small text-blush-200">
            فروشگاه آنلاین لوازم آرایشی و مراقبت پوست. محصولات اصل، انتخاب
            ساده‌تر.
          </p>
          <div className="flex items-center gap-3">
            <Link
              aria-label={`صفحه اینستاگرام ${SITE_NAME}`}
              href="https://www.instagram.com/mehrnilcom"
              target="_blank"
              rel="noreferrer"
              className="home-focus flex h-10 w-10 items-center justify-center rounded-full bg-ivory"
            >
              <Instagram_SVG classname="w-5" />
            </Link>
            <Link
              aria-label={`کانال تلگرام ${SITE_NAME}`}
              href="https://t.me/mehrnilcom"
              target="_blank"
              rel="noreferrer"
              className="home-focus flex h-10 w-10 items-center justify-center rounded-full bg-ivory"
            >
              <Telegram_SVG classname="w-5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <span className="text-small font-medium text-champagne">
                {group.title}
              </span>
              <ul className="flex flex-col gap-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="home-focus text-small text-ivory hover:text-champagne"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-small font-medium text-champagne">
            ارتباط با ما
          </span>
          <a
            href="tel:02191694827"
            className="home-focus flex items-center gap-2 text-body text-ivory"
          >
            <Phone_SVG classname="h-5 w-5 fill-champagne" />
            ۰۲۱-۹۱۶۹۴۸۲۷
          </a>
          <ul className="flex flex-col gap-3">
            {ADDRESSES.map((address, index) => (
              <li key={address} className="flex items-start gap-2">
                <Location_Pin classname="mt-0.5 h-5 w-5 shrink-0 fill-champagne" />
                <p className="text-small text-blush-200">
                  <span className="text-ivory">شعبه {index + 1}: </span>
                  {address}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex sm:justify-end">
          <Link
            referrerPolicy="origin"
            target="_blank"
            rel="noreferrer"
            href="https://trustseal.enamad.ir/?id=491421&Code=nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw"
            className="home-focus h-fit rounded-card bg-ivory p-3"
          >
            <img
              height={120}
              width={120}
              alt="نماد اعتماد الکترونیکی"
              referrerPolicy="origin"
              src="https://trustseal.enamad.ir/logo.aspx?id=491421&Code=nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw"
              {...{ code: "nWLgfgtO1aZxbPr2nb6vB7LIjve7BrXw" }}
            />
          </Link>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-caption text-blush-200 sm:flex-row">
        <span>تمامی حقوق برای {SITE_NAME} محفوظ است.</span>
        <span>
          طراحی شده توسط{" "}
          <span className="font-medium text-ivory">عباس رضائی</span>
        </span>
      </div>
    </footer>
  );
}
