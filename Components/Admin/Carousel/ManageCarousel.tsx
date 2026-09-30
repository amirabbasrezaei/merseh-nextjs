"use client";

import { readImageFile } from "@/Components/Admin/utils/readImageFile";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminButton from "../ui/AdminButton";
import AdminInput from "../ui/AdminInput";
import AdminLinkButton from "../ui/AdminLinkButton";
import AdminLoading from "../ui/AdminLoading";
import AdminPageHeader from "../ui/AdminPageHeader";
import AdminPanel from "../ui/AdminPanel";
import AdminSelect from "../ui/AdminSelect";

type Source = "CATEGORY" | "BRAND" | "MANUAL";

type PickedProduct = {
  id: number;
  name: string;
  status?: string;
};

type Props = {
  carouselId?: string;
};

const PRODUCT_LIMIT = 12;

export default function ManageCarousel({ carouselId }: Props) {
  const router = useRouter();
  const numericId = Number(carouselId);
  const isEdit = !!carouselId && !Number.isNaN(numericId);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.carousel.get.useQuery(
    { id: numericId },
    { enabled: isEdit }
  );
  const { data: categories } = trpc.product.flatCategories.useQuery();
  const { data: brands } = trpc.brand.list.useQuery();

  const [title, setTitle] = useState("");
  const [source, setSource] = useState<Source>("CATEGORY");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [products, setProducts] = useState<PickedProduct[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [image, setImage] = useState<{ base64: string; name: string } | null>(
    null
  );
  const [removeLogo, setRemoveLogo] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const searchQuery = trpc.carousel.searchProducts.useQuery(
    { query: debouncedSearch },
    { enabled: source === "MANUAL" && debouncedSearch.length > 0 }
  );

  useEffect(() => {
    if (!data?.carousel) return;
    const carousel = data.carousel;
    setTitle(carousel.title);
    setSource(carousel.source);
    setCategoryId(carousel.categoryId);
    setBrandId(carousel.brandId);
    setProducts(carousel.products);
    setIsActive(carousel.isActive);
    setLogoUrl(carousel.logoUrl);
    setImage(null);
    setRemoveLogo(false);
  }, [data]);

  const createCarousel = trpc.carousel.create.useMutation();
  const updateCarousel = trpc.carousel.update.useMutation();
  const saving = createCarousel.isPending || updateCarousel.isPending;
  const shownLogo = removeLogo ? null : image?.base64 || logoUrl;

  const changeSource = (next: Source) => {
    setSource(next);
    if (next !== "CATEGORY") setCategoryId(null);
    if (next !== "BRAND") setBrandId(null);
    if (next !== "MANUAL") setProducts([]);
  };

  const addProduct = (product: PickedProduct) => {
    if (products.some((item) => item.id === product.id)) return;
    if (products.length >= PRODUCT_LIMIT) {
      toast.error(`حداکثر ${PRODUCT_LIMIT} محصول می‌توانید انتخاب کنید`);
      return;
    }
    setProducts((current) => [...current, product]);
    setSearch("");
  };

  const moveProduct = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= products.length) return;
    setProducts((current) => {
      const copy = [...current];
      const item = copy[index];
      copy[index] = copy[next];
      copy[next] = item;
      return copy;
    });
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("نام کاروسل را وارد کنید");
      return;
    }
    if (source === "CATEGORY" && !categoryId) {
      toast.error("یک دسته‌بندی انتخاب کنید");
      return;
    }
    if (source === "BRAND" && !brandId) {
      toast.error("یک برند انتخاب کنید");
      return;
    }

    const payload = {
      title: title.trim(),
      source,
      categoryId: source === "CATEGORY" ? categoryId : null,
      brandId: source === "BRAND" ? brandId : null,
      productIds: source === "MANUAL" ? products.map((product) => product.id) : [],
      isActive,
      image: image || undefined,
    };

    try {
      if (isEdit) {
        await updateCarousel.mutateAsync({
          id: numericId,
          ...payload,
          removeLogo,
        });
        toast.success("کاروسل ذخیره شد");
        await utils.carousel.list.invalidate();
        await utils.carousel.get.invalidate({ id: numericId });
        return;
      }

      const created = await createCarousel.mutateAsync(payload);
      toast.success("کاروسل ایجاد شد");
      await utils.carousel.list.invalidate();
      router.push(`/admin/carousel/${created.carousel.id}`);
    } catch (error: any) {
      toast.error(error?.message || "ذخیره ناموفق بود");
    }
  };

  if (isEdit && isLoading) return <AdminLoading />;

  return (
    <div className="relative flex w-full flex-col gap-5 pb-24">
      <AdminPageHeader
        title={isEdit ? "ویرایش کاروسل" : "افزودن کاروسل"}
        actions={
          <AdminLinkButton href="/admin/carousels" variant="secondary" size="sm">
            بازگشت به لیست
          </AdminLinkButton>
        }
      />

      <AdminPanel title="نام و لوگو">
        <AdminInput
          label="نام"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="mt-4">
          {shownLogo ? (
            <div className="relative mb-4 h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
              {shownLogo.startsWith("data:") ? (
                <img
                  src={shownLogo}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image
                  src={shownLogo}
                  alt=""
                  fill
                  quality={70}
                  className="object-contain"
                  sizes="64px"
                />
              )}
            </div>
          ) : (
            <p className="mb-3 text-sm text-lightBlack">لوگو اختیاری است.</p>
          )}
          <input
            type="file"
            accept="image/*"
            className="text-sm text-gray-600 file:ml-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setImage(await readImageFile(file));
              setRemoveLogo(false);
            }}
          />
          {logoUrl || image ? (
            <AdminButton
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setImage(null);
                setRemoveLogo(true);
              }}
            >
              حذف لوگو
            </AdminButton>
          ) : null}
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          نمایش در صفحه اصلی
        </label>
      </AdminPanel>

      <AdminPanel title="منبع محصولات">
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["CATEGORY", "دسته‌بندی"],
              ["BRAND", "برند"],
              ["MANUAL", "انتخاب تک‌به‌تک"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => changeSource(value)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                source === value
                  ? "border-green2 bg-green2 text-white"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {source === "CATEGORY" ? (
          <AdminSelect
            label="دسته‌بندی"
            value={categoryId ?? ""}
            onChange={(e) =>
              setCategoryId(e.target.value ? Number(e.target.value) : null)
            }
            hint="تا ۱۲ محصول منتشرشده از این دسته و زیردسته‌ها نشان داده می‌شود. دکمه مشاهده بیشتر به صفحه دسته می‌رود."
          >
            <option value="">انتخاب کنید</option>
            {categories?.categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </AdminSelect>
        ) : null}

        {source === "BRAND" ? (
          <AdminSelect
            label="برند"
            value={brandId ?? ""}
            onChange={(e) =>
              setBrandId(e.target.value ? Number(e.target.value) : null)
            }
            hint="تا ۱۲ محصول منتشرشده این برند نشان داده می‌شود. دکمه مشاهده بیشتر به صفحه برند می‌رود."
          >
            <option value="">انتخاب کنید</option>
            {brands?.brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </AdminSelect>
        ) : null}

        {source === "MANUAL" ? (
          <div className="flex flex-col gap-3">
            <AdminInput
              label="جستجوی محصول"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="نام محصول"
              hint="محصول‌ها را یکی‌یکی اضافه کنید. برای این حالت دکمه مشاهده بیشتر نمایش داده نمی‌شود."
            />
            {searchQuery.data?.products.length ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                {searchQuery.data.products.map((product) => {
                  const added = products.some((item) => item.id === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={added}
                      onClick={() => addProduct(product)}
                      className="flex w-full items-center justify-between border-b border-gray-100 px-3 py-2 text-right text-sm last:border-b-0 hover:bg-gray-50 disabled:text-gray-400"
                    >
                      <span>{product.name}</span>
                      <span>{added ? "اضافه شده" : "افزودن"}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="flex flex-col gap-2">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2"
                >
                  <span className="min-w-0 truncate text-sm text-black1">
                    {index + 1}. {product.name}
                  </span>
                  <div className="flex shrink-0 gap-1">
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveProduct(index, -1)}
                    >
                      بالا
                    </AdminButton>
                    <AdminButton
                      variant="secondary"
                      size="sm"
                      disabled={index === products.length - 1}
                      onClick={() => moveProduct(index, 1)}
                    >
                      پایین
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        setProducts((current) =>
                          current.filter((item) => item.id !== product.id)
                        )
                      }
                    >
                      حذف
                    </AdminButton>
                  </div>
                </div>
              ))}
              {!products.length ? (
                <p className="text-sm text-lightBlack">
                  هنوز محصولی انتخاب نشده است.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </AdminPanel>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:right-64">
        <AdminButton disabled={saving} onClick={handleSave}>
          {saving ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد کاروسل"}
        </AdminButton>
      </div>
    </div>
  );
}
