"use client";
import React from "react";
import { create } from "zustand";

interface Props {
  children: React.ReactNode;
  AuthorizeStatus: any;
}

export type ThemeType = {
  openAuthModal: boolean;
};

export const useThemeStore = create<ThemeType>(() => ({
  openAuthModal: false,
}));

export default function ThemeController({ children }: Props) {
  return <>{children}</>;
}
