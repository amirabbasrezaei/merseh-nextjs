"use client";
import { trpc } from "@/utils/trpc";
import React, { useEffect } from "react";
import { atom, useRecoilState } from "recoil";

interface Props {
  children: React.ReactNode;
  AuthorizeStatus: any;
}

export type ThemeType = {
  openAuthModal: boolean;
};
export const themeRecoilStateAtom = atom<ThemeType>({
  key: "theme",
  default: { openAuthModal: false },
});

export default function ThemeController({ children, AuthorizeStatus }: Props) {
  const [themeStore, setThemeStore] = useRecoilState(themeRecoilStateAtom);
  const { ssrContext } = trpc.useUtils();

  // useEffect(() => {
  //   if (AuthorizeStatus === "need_login") {
  //     setThemeStore({ openAuthModal: true });
  //   }
  //   else {
  //     setThemeStore({ openAuthModal: false });
  //   }
  // }, [ssrContext]);
  return <>{children}</>;
}
