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
import AdminTextarea from "../ui/AdminTextarea";

type Props = {
  brandId?: string;
};

type PendingImage = { base64: string; name: string };

export default function ManageBrand({ brandId }: Props) {
  const router = useRouter();
  const numericId = Number(brandId);
  const isEdit = !!brandId && !Number.isNaN(numericId);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.brand.get.useQuery(
    { id: numericId },
    { enabled: isEdit }
  );

  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [content, setContent] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [image, setImage] = useState<PendingImage | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    if (!data?.brand) return;
    setName(data.brand.name);
    setEnglishName(data.brand.englishName);
    setContent(data.brand.content);
    setMetaDescription(data.brand.metaDescription);
    setIsActive(data.brand.isActive);
    setLogoUrl(data.brand.logoUrl);
    setImage(null);
    setRemoveLogo(false);
  }, [data]);

  const createBrand = trpc.brand.create.useMutation();
  const updateBrand = trpc.brand.update.useMutation();
  const saving = createBrand.isPending || updateBrand.isPending;

  const shownLogo = removeLogo ? null : image?.base64 || logoUrl;

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("نام برند را وارد کنید");
      return;
    }

    const payload = {
      name: trimmed,
      englishName,
      content,
      metaDescription,
      isActive,
      image: image || undefined,
    };

    try {
      if (isEdit) {
        await updateBrand.mutateAsync({
          id: numericId,
          ...payload,
          removeLogo,
        });
        toast.success("برند ذخیره شد");
        await utils.brand.list.invalidate();
        await utils.brand.get.invalidate({ id: numericId });
        return;
      }

      const created = await createBrand.mutateAsync(payload);
      toast.success("برند ایجاد شد");
      await utils.brand.list.invalidate();
      router.push(`/admin/brand/${created.brand.id}`);
    } catch (error: any) {
      toast.error(error?.message || "ذخیره ناموفق بود");
    }
  };

  if (isEdit && isLoading) return <AdminLoading />;

  return (
    <div className="relative flex w-full flex-col gap-5 pb-24">
      <AdminPageHeader
        title={isEdit ? "ویرایش برند" : "افزودن برند"}
        actions={
          <AdminLinkButton href="/admin/brands" variant="secondary" size="sm">
            بازگشت به لیست
          </AdminLinkButton>
        }
      />

      <AdminPanel title="اطلاعات پایه">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminInput
            label="نام"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <AdminInput
            label="نام انگلیسی"
            value={englishName}
            onChange={(e) => setEnglishName(e.target.value)}
            dir="ltr"
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          فعال و قابل نمایش در سایت
        </label>
      </AdminPanel>

      <AdminPanel title="لوگو">
        {shownLogo ? (
          <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {shownLogo.startsWith("data:") ? (
              <img
                src={shownLogo}
                alt={name || "لوگو"}
                className="h-full w-full object-contain"
              />
            ) : (
              <Image
                src={shownLogo}
                alt={name || "لوگو"}
                fill
                quality={70}
                className="object-contain"
                sizes="96px"
              />
            )}
          </div>
        ) : (
          <p className="mb-3 text-sm text-lightBlack">لوگویی انتخاب نشده است.</p>
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
      </AdminPanel>

      <AdminPanel title="توضیحات">
        <div className="flex flex-col gap-4">
          <AdminTextarea
            label="توضیح برند"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
          />
          <AdminTextarea
            label="توضیحات متا"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
          />
        </div>
      </AdminPanel>

      <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-end gap-3 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:right-64">
        <AdminButton disabled={saving} onClick={handleSave}>
          {saving ? "در حال ذخیره…" : isEdit ? "ذخیره تغییرات" : "ایجاد برند"}
        </AdminButton>
      </div>
    </div>
  );
}
