import React, { useState } from "react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import { trpc } from "@/utils/trpc";

export default function SelectProduct() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = trpc.product.detailedProductList.useQuery();
  console.log((data as any) );
  return (
    <div>
      {isOpen && process.browser
        ? createPortal(
            <motion.div
              key="portal"
              initial={{ opacity: 0, backdropFilter: "blur(0px)", zIndex: 30 }}
              animate={{ opacity: 1, backdropFilter: "blur(2px)", zIndex: 30 }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{ zIndex: 20 }}
              className="w-full h-fit sm:h-full   flex items-center justify-center absolute sm:fixed left-0 right-0  top-0 bottom-0 "
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
                className="bg-white "
              ></motion.div>
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
