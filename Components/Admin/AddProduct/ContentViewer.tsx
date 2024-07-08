import React, { createElement } from "react";
import { contentType } from "./QuillEditor";

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

                return createElement(node.type, {
                  src: !(node.content.src as string)?.includes("https://")
                    ? `data:image/${node.content.format},${node.content.src}`
                    : node.content.src,
                  key: node.content.name,
                  alt: node.content.name,
                });
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
    <article className="[&_h2]:text-[25px] [&_h3]:text-[20px]">
      <ContentViewer contentForView={contentForView} />
    </article>
  );
}
