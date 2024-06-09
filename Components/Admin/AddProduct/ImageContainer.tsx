"use client";
import React from "react";

interface Props {
  src: string;
  alt: string;
}

export default function ImageContainer({ src, alt }: Props) {
  return <img src={src} alt={alt} />;
}
