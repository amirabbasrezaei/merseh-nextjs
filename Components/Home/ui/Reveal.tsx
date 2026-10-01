"use client";

import { useInView } from "react-intersection-observer";

export function useReveal() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "0px 0px -8% 0px",
    fallbackInView: true,
  });
  return { ref, revealClass: inView ? "home-reveal is-in" : "home-reveal" };
}
