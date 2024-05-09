"use client"
import React, { Children } from "react";
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from "recoil";

interface Props {
  children: React.ReactNode;
}

export default function RecoilRootProvider({ children }: Props) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
