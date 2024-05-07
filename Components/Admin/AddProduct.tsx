"use client";
import { trpc } from "@/utils/trpc";
import { btoa } from "buffer";
import React, { useEffect, useState } from "react";

type imageType = { base64: string; name: string };

export default function AddProduct() {
  const { mutateAsync } = trpc.product.addProduct.useMutation({});
  const [images, setImages] = useState<imageType[]>([]);
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [files, setFiles] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const reader = new FileReader();
  const [flag, setFlag] = useState(false);
  useEffect(() => {
    if ((files as any)?.length && !flag) {
      setFlag(true);
      setFiles(Array.prototype.slice.call(files) as any);
    }
  }, [files]);

  useEffect(() => {
    console.log(currentImageIndex, files);
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
    console.log(images);
  }, [currentImageIndex, files]);

  return (
    <form
      onChange={(e) => {
        setCurrentImageIndex(0);
        setImages([]);
        setFlag(false);
        setFiles((e.target as any).files);
      }}
      className="w-full max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        mutateAsync({
          images: images,
          name: name,
          price: price,
        }).then((res) => console.log(res));
      }}
    >
      <div>
        <input multiple type="file" accept="image/*" />
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

      <div className="flex flex-wrap -mx-3 mb-2">
        <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            htmlFor="grid-state"
          >
            دسته بندی
          </label>
          <div className="relative">
            <select
              className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="grid-state"
            >
              <option>New Mexico</option>
              <option>Missouri</option>
              <option>Texas</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <button disabled={isLoading}>submit</button>
    </form>
  );
}
