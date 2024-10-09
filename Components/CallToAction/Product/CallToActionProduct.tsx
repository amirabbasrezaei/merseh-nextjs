import { AddToShoppingCart_SVG } from "@/Components/SVGS";
import useShoppingCart from "@/Components/useShoppingCart";
import splitNumber from "@/Components/utils/splitNumber";
import Image from "next/image";
import Link from "next/link";

export interface CallToActionProductType {
  product_name: string;
  product_id: number;
  variationId?: number;
  variation_value_id?: number;
  variation_value_name?: string;
  price: number;
  imageurl: string;
  setShowPostOptions: (e: any) => void;
}

export default function CallToActionProduct({
  imageurl,
  price,
  product_name,
  product_id,
  setShowPostOptions,
}: CallToActionProductType) {
  const { addProduct } = useShoppingCart();

  return (
    <div className="w-fit h-full p-5 px-7 bg-white rounded-[18px] flex flex-col items-center shadow-[0px_4px_15.8px_#0000004a] gap-5 shadow-[#00000067] ">
      <Link
        onClick={(e) => {
          // Only prevent navigation if the "Add to Cart" button is clicked
          e.preventDefault();
        }}
        style={{ background: "white" }}
        href={`/product/${product_id}/${product_name.replaceAll(" ", "-")}`}
      >
        <div className="bg-white flex flex-col items-center gap-4">
          <Image
            src={imageurl}
            alt={imageurl.split("/").at(-1)?.split(".")[0] || ""}
            quality={100}
            width={250}
            height={250}
            className="rounded-t-[18px] bg-white"
          />
          <span className="text-[#313131] text-[20px] font-[600] ">
            {product_name}
          </span>
          <span className="text-[#008E63] font-[500]">
            {splitNumber(price)} تومان
          </span>
        </div>
      </Link>
      <div
        onClick={() => {
          addProduct(product_name, price, product_id).then(() =>
            setShowPostOptions(true)
          );
        }}
        className="border cursor-pointer border-[#E8E8E8] px-2 py-1 rounded-lg flex flex-row gap-3"
      >
        <span className="text-[#006CD0] text-[15px] font-[500]">افزودن به سبد خرید</span>
        <AddToShoppingCart_SVG classname="w-5 fill-[#006CD0]" />
      </div>
    </div>
  );
}
