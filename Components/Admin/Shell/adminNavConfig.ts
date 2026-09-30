export const ADMIN_NAV_ITEMS = [
  { href: "/admin/products", slug: "products", label: "محصول‌ها" },
  { href: "/admin/articles", slug: "articles", label: "مقاله‌ها" },
  { href: "/admin/banners", slug: "banners", label: "بنرها" },
  { href: "/admin/categories", slug: "categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/brands", slug: "brands", label: "برندها" },
  { href: "/admin/carousels", slug: "carousels", label: "کاروسل‌ها" },
  { href: "/admin/comments", slug: "comments", label: "دیدگاه‌ها" },
  { href: "/admin/users", slug: "users", label: "کاربران" },
  { href: "/admin/orders", slug: "orders", label: "سفارش‌ها" },
  { href: "/admin/settings", slug: "settings", label: "حساب ادمین" },
] as const;

export function getAdminTitle(pathname: string): string {
  if (pathname.startsWith("/admin/product")) return "محصول";
  if (pathname.startsWith("/admin/article")) return "مقاله";
  if (pathname.startsWith("/admin/category")) return "دسته‌بندی";
  if (pathname.startsWith("/admin/brand")) return "برند";
  if (pathname.startsWith("/admin/carousel")) return "کاروسل";
  if (pathname.startsWith("/admin/settings")) return "حساب ادمین";
  const match = ADMIN_NAV_ITEMS.find((item) => pathname.includes(item.slug));
  return match?.label ?? "پنل مدیریت";
}
