import React, { useEffect, useState } from "react";

export default function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (window !== undefined) {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, [window]);
  return { width: windowSize.width, height: windowSize.height };
}
