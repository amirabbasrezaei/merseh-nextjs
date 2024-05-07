"use client";
import { trpc } from "@/utils/trpc";
import { btoa } from "buffer";
import React, { useEffect, useState } from "react";
import Categories from "../Products/Categories";
import { filterTypeArgs } from "../Products/Products";

type imageType = { base64: string; name: string };

export default function AddProduct() {
  const { mutateAsync } = trpc.product.addProduct.useMutation({});
  const [images, setImages] = useState<imageType[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [files, setFiles] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [flag, setFlag] = useState(false);
  const [filter, setFilter] = useState<filterTypeArgs>({});
  useEffect(() => {
    if ((files as any)?.length && !flag) {
      setFlag(true);
      setFiles(Array.prototype.slice.call(files) as any);
    }
  }, [files]);

  useEffect(() => {
    const reader = new FileReader();
    if (
      (files as any)?.length &&
      currentImageIndex < (files as any)?.length &&
      flag
    ) {
      (async () => {
        if ((files as any)[currentImageIndex] !== undefined) {
          const chooseImage = (files as any)[currentImageIndex];
          reader.onloadend = (res) => {
            const promise = new Promise((resolved) => {
              setImages((state: imageType[]) => [
                ...state,
                {
                  base64: (res.target?.result as string)
                    .replace("data:", "")
                    .replace(/^.+,/, ""),
                  name: chooseImage.name,
                },
              ]);
              resolved({ nextIndex: currentImageIndex + 1, status: true });
            });

            promise.then(({ nextIndex, status }: any) => {
              if (status === true) {
                setCurrentImageIndex(nextIndex as number);
              }
            });
          };
          await reader.readAsDataURL(chooseImage);
        }
      })();
    }
  }, [currentImageIndex, files]);

  useEffect(() => {
    console.log(images);
  }, [images]);

  return (
    <form
      className="w-full max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        console.log({
          images: images,
          name: name,
          price: price,
        });
        if (filter.categoryId) {
          mutateAsync({
            images: images,
            name: name,
            price: price,
            categoryId: String(filter.categoryId),
          }).then((res) => console.log(res));
        }
      }}
    >
      <div>
        <input
          onChange={(e) => {
            setCurrentImageIndex(0);
            setImages([]);
            setFlag(false);
            setFiles((e.target as any).files);
          }}
          multiple
          type="file"
          // accept="image/*"
        />
      </div>
      <div className="flex flex-wrap -mx-3 mb-6">
        <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-first-name"
          >
            نام محصول
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-red-500 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
            id="grid-first-name"
            type="text"
            placeholder="Jane"
          />
          <p className="text-red-500 text-xs italic">
            Please fill out this field.
          </p>
        </div>
        <div className="w-full md:w-1/2 px-3">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-last-name"
          >
            قیمت
          </label>
          <input
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-last-name"
            type="text"
            placeholder="Doe"
            value={price}
            onChange={(e) => setPrice(e.currentTarget.value)}
          />
        </div>
      </div>

      <Categories setFilter={setFilter} />
      <button>submit</button>
    </form>
  );
}
