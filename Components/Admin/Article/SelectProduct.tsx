"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";
import { createPortal } from "react-dom";
import AdminButton from "../ui/AdminButton";

type ProductCallToAction = {
  productId: string;
  variationId?: number | null;
  variationValueId?: number | null;
};

interface Props {
  onInsert: (html: string) => void;
}

export default function SelectProduct({ onInsert }: Props) {
  const [isClient, setIsClient] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductCallToAction[]
  >([]);
  const { data } = trpc.product.detailedProductList.useQuery(undefined, {
    gcTime: 0,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && isOpen
        ? createPortal(
            <motion.div
              key="portal"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <h3 className="text-sm font-semibold text-black1">
                    انتخاب محصول برای افزودن
                  </h3>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    بستن
                  </AdminButton>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-2 overflow-auto p-4 sm:grid-cols-2 md:grid-cols-3">
                  {data?.productSchema?.length
                    ? data.productSchema.map((pr, i) => {
                        const selected = selectedProducts.find(
                          (e) => e.productId === pr.product_id
                        );
                        return (
                          <button
                            type="button"
                            className={classNames(
                              "rounded-lg border p-3 text-right text-sm transition-colors",
                              selected
                                ? "border-green2/40 bg-green2/5 text-green2"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            )}
                            key={i}
                            onClick={() => {
                              const isInList = selectedProducts.find(
                                (e) =>
                                  e.productId === pr.product_id ||
                                  (e.productId === pr.product_id &&
                                    e.variationValueId === pr.variationValueId)
                              );
                              if (isInList) {
                                setSelectedProducts((state) =>
                                  state.filter((e) => {
                                    if (isInList.variationValueId) {
                                      return isInList.productId !== e.productId;
                                    }
                                    return e.productId !== pr.product_id;
                                  })
                                );
                                return;
                              }
                              setSelectedProducts((state) => [
                                ...state,
                                {
                                  productId: pr.product_id,
                                  variationId: pr?.variationId,
                                  variationValueId: pr?.variationValueId,
                                },
                              ]);
                            }}
                          >
                            {pr.product_name +
                              (pr?.variationValueName
                                ? ` - ${pr.variationValueName}`
                                : "")}
                          </button>
                        );
                      })
                    : (
                      <p className="col-span-full py-8 text-center text-sm text-lightBlack">
                        محصولی یافت نشد
                      </p>
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
                  <AdminButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    انصراف
                  </AdminButton>
                  <AdminButton
                    size="sm"
                    onClick={() => {
                      onInsert(
                        `<p>/ctap/${selectedProducts
                          .map((e) => e.productId)
                          .join(",")}/*ctap/</p>`
                      );
                      setSelectedProducts([]);
                      setIsOpen(false);
                    }}
                  >
                    افزودن کالاها
                  </AdminButton>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )
        : null}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
      >
        افزودن محصول
      </button>
    </div>
  );
}
