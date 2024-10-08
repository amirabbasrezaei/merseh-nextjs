import React, { useState } from "react";
import { motion } from "framer-motion";

const parentAnimation = {
  open: {},
  closed: {},
};

export default function SelectInput_2() {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  return (
    <motion.div
      animate={showOptions ? "open" : "closed"}
      variants={parentAnimation}
    >
      <motion.div>گزینه ها</motion.div>
      <motion.div></motion.div>
      <motion.div></motion.div>
    </motion.div>
  );
}
