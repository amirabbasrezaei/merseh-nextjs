import { galleryImageUrls, galleryInclude } from "./storage";

export const PRODUCT_SECTION_LIMIT = 12;

type StoreBrand = {
  id: number;
  name: string;
  isActive: boolean;
} | null;

export function productCardInclude() {
  return {
    ...galleryInclude(),
    brand: {
      select: {
        id: true,
        name: true,
        isActive: true,
      },
    },
  };
}

export function mapStoreBrand(brand: StoreBrand) {
  if (!brand?.isActive) return null;
  return { id: brand.id, name: brand.name };
}

export function mapProductCard<
  T extends {
    id: number;
    name: string;
    price: number;
    galleryFiles?: { file: { key: string } }[];
    brand?: StoreBrand;
  },
>(product: T) {
  const imageNames = galleryImageUrls(product.galleryFiles);
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: imageNames[0] || "",
    imageNames,
    brand: mapStoreBrand(product.brand ?? null),
  };
}
