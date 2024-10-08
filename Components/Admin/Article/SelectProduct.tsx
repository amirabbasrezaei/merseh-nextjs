import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { trpc } from "@/utils/trpc";
import classNames from "classnames";

type ProductCallToAction = {
  productId: string;
  variationId?: number | null;
  variationValueId?: number | null;
};

interface Props {
  setValue: (e: any) => void;
}

export default function SelectProduct({ setValue }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<
    ProductCallToAction[]
  >([]);
  const { data } = trpc.product.detailedProductList.useQuery(undefined, {
    cacheTime: 0,
  });

  //   useEffect(() => {
  //     console.log(selectedProducts);
  //   }, [selectedProducts]);

  return (
    <div>
      {isOpen && process.browser
        ? createPortal(
            <motion.div
              key="portal"
              animate={{
                opacity: 1,
                backdropFilter: "blur(2px) brightness(90%)",
              }}
              exit={{
                opacity: 0,
                backdropFilter: "blur(0px) brightness(100%)",
              }}
              initial={false}
              transition={{ duration: 0.3 }}
              className="fixed w-full h-screen left-0 top-0 right-0 bottom-0 z-40 flex items-center justify-center"
              onClick={(e) => {
                setIsOpen(false);
              }}
              style={{ zIndex: 20 }}
            >
              <motion.div
                initial={{ translateY: 100 }}
                animate={{ translateY: 0 }}
                exit={{ translateY: -50 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  bounce: 0.3,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-white rounded-md p-5"
              >
                <div className="w-full h-full grid  grid-cols-4 gap-5 p-10">
                  {data?.productSchema?.length
                    ? data.productSchema.map((pr, i) => (
                        <div
                          className={classNames(
                            " rounded-md p-3 cursor-pointer",
                            selectedProducts.find(
                              (e) => e.productId === pr.product_id
                            )
                              ? "bg-green1"
                              : "bg-gray-100"
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
                          <span>
                            {pr.product_name +
                              (pr?.variationValueName
                                ? ` - ${pr.variationValueName}`
                                : "")}
                          </span>
                        </div>
                      ))
                    : null}
                </div>
                <div className="flex w-full items-center justify-center">
                  <button
                    onClick={() => {
                      setValue(
                        (state: any) =>
                          state +
                          `<p>/ctap/${selectedProducts.map(
                            (e) => e.productId
                          )}/*ctap/</p>`
                      );
                      setSelectedProducts([])
                    }}
                    className="bg-green1 px-4 py-2 rounded-md text-white"
                  >
                    افزودن کالاها
                  </button>
                </div>
              </motion.div>
            </motion.div>,
            document.body
          )
        : null}
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        افزودن محصول
      </span>
    </div>
  );
}
