"use client";

import { RefObject, useEffect, useState } from "react";

const SCROLLED_AFTER_PX = 8;
const HIDE_NAV_AFTER_PX = 160;
const DIRECTION_THRESHOLD_PX = 6;

type HeaderScroll = {
  scrolled: boolean;
  navHidden: boolean;
};

export default function useHeaderScroll(
  ref: RefObject<HTMLElement | null>,
): HeaderScroll {
  const [state, setState] = useState<HeaderScroll>({
    scrolled: false,
    navHidden: false,
  });

  useEffect(() => {
    const scroller = ref.current?.closest("main");
    if (!scroller) return;

    let lastTop = scroller.scrollTop;
    let frame = 0;

    const update = () => {
      frame = 0;
      const top = scroller.scrollTop;
      const delta = top - lastTop;
      if (Math.abs(delta) < DIRECTION_THRESHOLD_PX && top > SCROLLED_AFTER_PX) {
        return;
      }
      lastTop = top;

      const scrolled = top > SCROLLED_AFTER_PX;
      const navHidden = delta > 0 && top > HIDE_NAV_AFTER_PX;
      setState((prev) =>
        prev.scrolled === scrolled && prev.navHidden === navHidden
          ? prev
          : { scrolled, navHidden },
      );
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);

  return state;
}
