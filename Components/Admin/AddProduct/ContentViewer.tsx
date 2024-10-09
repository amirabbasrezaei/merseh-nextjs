
import React, { createElement } from "react";
import { contentType } from "./QuillEditor";
import Image from "next/image";
import Link from "next/link";
import { IRANSansXFaNum } from "../../../app/fonts";
import classNames from "classnames";
import { trpc } from "@/utils/trpc";
import CallToActionProducts from "@/Components/CallToAction/Product/CallToActionProducts";

interface Props {
  contentForView: contentType[];
}
export function ContentViewer({ contentForView }: Props) {
  return (
    <>
      {contentForView
        ? contentForView.map((node: contentType, i: number) => {
            if (!node?.childs?.length) {
              if (node.type === "img" && typeof node.content !== "string") {
                return (
                  <div
                    key={node.content.name}
                    className="w-full flex flex-row justify-center items-center"
                  >
                    <Image
                      src={
                        !(node.content.src as string)?.includes("https://")
                          ? `data:image/${node.content.format},${node.content.src}`
                          : node.content.src
                      }
                      width={1000}
                      height={700}
                      alt={node.content.name || ""}
                      quality={100}
                      priority={false}
                      key={node?.content?.name || ""}
                    />
                  </div>
                );
              }
              if (node.type === "br") {
                return <br key={i} />;
              }

              return node.content;
            }
            if (node.type === "a" && typeof node.content === "string") {
              return (
                <Link key={i} href={node.content}>
                  {node?.childs?.length ? (
                    <ContentViewer contentForView={node.childs} />
                  ) : null}
                </Link>
              );
            }
            if (
              node.type === "p" &&
              node.childs.length &&
              typeof node.childs[0]?.content == "string" &&
              node.childs[0]?.content?.includes("/ctap/")
            ) {

              const products = JSON.parse(
                node.childs[0]?.content
                  .replace("/ctap/", "")
                  .replace("/*ctap/", "") 
              );
              console.log(products);
              return <CallToActionProducts key={i} products={products} />;
            }

            if (node?.childs?.length) {
              return createElement(
                node.type,
                { key: i },
                // ContentViewer({ contentForView: node.childs })
                <ContentViewer contentForView={node.childs} />
              );
            }

            if (typeof node.content === "string") {
              createElement(node.type, { key: i, className: "" }, node.content);
            }
            return <div key={i}></div>;
          })
        : null}
    </>
  );
}

export default function Content({ contentForView }: Props) {
  return (
    <article
      className={classNames(
        "[&_h2]:text-[22px] text-[17px] [&_a]:font-[500] [&_a]:bg-[#2dcc9c17] [&_a]:px-[5px] [&_a]:py-[2px] [&_a]:rounded-md text-justify [&_h2]:font-[600] [&_h2]:text-[#224d32] [&_ul]:list-disc [&_ol]:list-decimal   [&_a]:text-[#0a6e75] [&_ul]:list-inside [&_ol]:list-inside  text-[#5a5a5a]    leading-loose [&_h3]:text-[#555555] [&_h3]:text-[20px] [&_h3]:font-[600] flex flex-col md:text-[18px]",
        IRANSansXFaNum.className
      )}
    >
      <ContentViewer contentForView={contentForView} />
    </article>
  );
}
