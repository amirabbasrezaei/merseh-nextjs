export type ProfileSectionId = "account" | "addresses" | "orders";

export type ProfileSection = {
  id: ProfileSectionId;
  href: string;
  label: string;
  description: string;
};

export const PROFILE_SECTIONS: readonly ProfileSection[] = [
  {
    id: "account",
    href: "/profile",
    label: "اطلاعات حساب",
    description: "مشخصات فردی",
  },
  {
    id: "addresses",
    href: "/profile/addresses",
    label: "آدرس‌ها",
    description: "نشانی‌های ارسال",
  },
  {
    id: "orders",
    href: "/profile/orders",
    label: "سفارش‌ها",
    description: "پیگیری خریدها",
  },
];

export function findProfileSectionBySlug(slug: string) {
  return PROFILE_SECTIONS.find(
    (section) => section.id !== "account" && section.href === `/profile/${slug}`,
  );
}
