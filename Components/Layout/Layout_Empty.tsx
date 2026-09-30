import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function Layout_Empty({ children }: Props) {
  return <main className="h-screen w-screen">{children}</main>;
}
