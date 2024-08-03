import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Props {
  image_alt: string;
  image_src: string;
  title: string;
  href: string;
}

export default function SuggestedArticleCard({
  href,
  title,
  image_alt,
  image_src,
}: Props) {
  return (
    <Link href={href}>
      <div className="w-full h-full relative ">
        <Image
          className="rounded-md  brightness-75"
          objectFit="cover"
          fill
          alt={image_alt}
          src={image_src}
        />
        <div className="absolute backdrop-blur-[2px]  w-full h-full top-0 right-0 flex items-center justify-center">

        <h2 className=" ">{title}</h2>
        </div>
      </div>
    </Link>
  );
}
