import { Chevron_Down,  } from "@/Components/SVGS";
import { motion } from "framer-motion";
import React, { useState } from "react";
interface Props {
  customer_name: string;
  id: string;
  section: string;
  commentCount?: number;
  province: string;
  city: string;
  phoneNumber: string;
}

export default function Order_item({
  customer_name ,
  id,
  section,
  commentCount,
province
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="border flex flex-col w-full p-5 rounded-md justify-between gap-5">
      <div className=" flex flex-row  justify-between">
        <span>
          شماره سفارش : <span className="font-[500]">{id}</span>
        </span>

        <span>کاربر : {customer_name}</span>
      </div>
      <motion.div
        initial={false}
        variants={{
          open: {
            y: 0,
            transition: { duration: 0.3 },
            height: "fit-content",
            opacity: 1,
          },
          hidden: {
            y: 40,
            height: 0,
            opacity: 0,
            transition: { duration: 0.3 },
          },
        }}
        animate={showDetails ? "open" : "hidden"}
      >
<div className="grid grid-cols-2">
  <div>
    <div><span>نام مشتری</span>:<span>{customer_name}</span></div>
    <div><span>استان</span>:<span>{province}</span></div>
    <div><span>شهر</span>:<span>{province}</span></div>
  </div>
</div>
      </motion.div>
      <div
        onClick={() => setShowDetails((state) => !state)}
        className="w-full flex justify-center"
      >
        <Chevron_Down classname="w-3 fill-gray-500 cursor-pointer" />
      </div>
    </div>
  );
}
