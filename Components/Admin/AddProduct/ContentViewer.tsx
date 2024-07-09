import React, { createElement } from "react";
import { contentType } from "./QuillEditor";
import Image from "next/image";

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
                      alt={node.content.name}
                      quality={80}
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
    <article className="[&_h2]:text-[25px] [&_ul]:list-disc text-[#525252] [&_h2]:text-[#3e3e3e]   leading-loose [&_h3]:text-[#3e3e3e] [&_h3]:text-[20px] flex flex-col ">
      <ContentViewer contentForView={contentForView} />
    </article>
  );
}
