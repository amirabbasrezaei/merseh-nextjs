"use client";
import React, { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

interface Props {
  children: React.ReactNode;
  AuthorizeStatus: any;
}

type ThemeType = {
  openAuthModal: boolean;
};
const themeRecoilStateAtom = atom<ThemeType>({
  key: "theme",
  default: { openAuthModal: false },
});

export default function ThemeController({ children, AuthorizeStatus }: Props) {
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);

  useEffect(() => {
    if (AuthorizeStatus === "need_login") {
      setThemeStore({ openAuthModal: true });
    }
  }, []);
  return <>{children}</>;
}
