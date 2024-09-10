'use client'
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Props {
  image_alt: string;
  image_src: string;
  title: string;
  href: string;
  createDate?: string;
}

export default function SuggestedArticleCard({
  href,
  title,
  image_alt,
  image_src,
  createDate,
}: Props) {
  const [hour, setHour] = useState<number>();
  const [day, setDay] = useState<number>();


  useEffect(() => {
    if (createDate) {
      const hoursTillWrite = (
        new Date(
          new Date(Date.now()).getTime() - new Date(createDate).getTime()
        ).getTime() / 3600000
      ).toFixed(0);

      if (Number(hoursTillWrite) > 24) {
        const convert_to_day = Number((Number(hoursTillWrite) / 24).toFixed(0));
        setDay(convert_to_day);
      } else {
        setHour(Number(hoursTillWrite));
      }
    }
  }, []);

  return (
    <Link href={href}>
      <div className="w-full h-full relative ">
        <Image
          className="rounded-md  brightness-[50%]"
          objectFit="cover"
          fill
          alt={image_alt}
          src={image_src}
          priority
          quality={80}
        />

        <div className="absolute  px-5  w-full h-full top-0 right-0 flex items-center justify-center">
          <h2 className=" ">{title}</h2>
        </div>
        <div className="absolute bottom-4 left-4 text-[13px]">
          {hour || day ? <span className="  ">{hour ? hour : day}&ensp;</span> : null}

          {hour ? <span>ساعت قبل</span> : day ? <span>روز قبل</span> : null}
        </div>
      </div>
    </Link>
  );
}
