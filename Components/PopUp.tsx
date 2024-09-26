import React from "react";
import { motion, AnimationProps, AnimationControls } from "framer-motion";

const animation = {
  open: {},
  closed: {},
};



export default function PopUp() {
  return (
    <>
      {process?.browser ? (
        <motion.div
          initial={false}
          animate={animation.open}
          exit={animation.closed}
        >
          PopUp
        </motion.div>
      ) : null}
    </>
  );
}
