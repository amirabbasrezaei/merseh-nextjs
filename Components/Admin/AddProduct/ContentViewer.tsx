import React, { createElement } from "react";
import { contentType } from "./QuillEditor";
import Image from "next/image";
import Link from "next/link";
import { IRANSansXFaNum } from "../../../app/fonts";
import classNames from "classnames";
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
                      height={1000}
                      alt={node.content.name || ""}
                      quality={100}
                      priority={false}
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
        "[&_h2]:text-[22px] [&_h2]:font-[600] [&_h2]:text-[#3e3e3e] [&_ul]:list-disc [&_ol]:list-decimal   [&_a]:text-[#7ba79a] [&_ul]:list-inside [&_ol]:list-inside  text-[#5a5a5a]    leading-loose [&_h3]:text-[#555555] [&_h3]:text-[18px] [&_h3]:font-[600] flex flex-col md:text-[18px]",
        IRANSansXFaNum.className
      )}
    >
      <ContentViewer contentForView={contentForView} />
    </article>
  );
}
