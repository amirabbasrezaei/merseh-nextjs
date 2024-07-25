import React, {
  createElement,
  DOMAttributes,
  DOMElement,
  useEffect,
  useRef,
  useState,
} from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./MyComponent.module.css";

import { IRANYekanXFaNum } from "@/app/fonts";
import { Image_Svg } from "@/Components/SVGS";

export type contentType = {
  type: Node["nodeName"];
  content: string | { src: string; name: string; format: string };
  childs?: contentType[] | null;
};

interface Props {
  setContent: React.Dispatch<React.SetStateAction<contentType[]>>;
  content: contentType[];
  initialFlag?: boolean;
}

const contentToHTML = (content: contentType[], parent: HTMLElement): any => {
  for (let ct of content) {
    if (!ct.childs?.length) {
      if (ct.type === "#text") {
        const element = document.createElement("p", {});
        element.innerHTML = ct.content as string;
        parent.append(element);
        // break;
      } else if (ct.type === "img" && typeof ct.content !== "string") {
        const element = document.createElement("img", { is: ct.content.name });

        element.src =
          ct.content.format !== undefined
            ? `data:image/${ct.content.format},${ct.content.src}`
            : ct.content.src;
        element.alt = ct.content.name || "";
        parent.append(element);
      } else {
        const element = document.createElement(ct.type);
        element.innerHTML = ct.content as string;
        parent.append(element);
      }


    } else if (ct.type === "a" && typeof ct.content === "string") {
      console.log(ct);
      const element = document.createElement(ct.type);
      element.href = ct.content;
      // element.innerHTML = ct?.childs?.length
      //   ? contentToHTML(ct.childs, element)
      //   : "";
      parent.append(contentToHTML(ct.childs, element));
    } else {
      const secParent = document.createElement(ct.type);
      parent.append(contentToHTML(ct.childs, secParent));
    }
  }
  return parent;
};

const HTMLtoContent = (childNodes: NodeListOf<ChildNode> | []) => {
  if (!childNodes.length) {
    return null;
  }
  const result: contentType[] = [];
  childNodes.forEach((e) => {
    if (e.firstChild?.nodeName === "IMG") {
      result.push({
        content: {
          src:
            // @ts-ignore
            e.firstChild.src.replace("data:", "").replace(/^.+,/, "") || "",
          // @ts-ignore
          name: e.firstChild.alt,
          // @ts-ignore
          format: (e.firstChild.src as string).split("/").at(1)?.split(",")[0],
        },
        type: e.firstChild.nodeName.toLowerCase(),
        childs: null,
      });
      return;
    }

    if (e.nodeName === "A") {
      result.push({
        // @ts-ignore
        content: e.href,
        type: e.nodeName.toLowerCase(),
        childs: e?.childNodes.length ? HTMLtoContent(e.childNodes) : null,
      });
      return;
    }

    result.push({
      content: e?.nodeValue || "",
      type: e.nodeName.toLowerCase(),
      childs: HTMLtoContent(e.childNodes),
    });
  });

  return result;
};

export default function QuillEditor({
  setContent,
  content,
  initialFlag = false,
}: Props) {
  const [flag, setFlag] = useState(initialFlag);
  const [value, setValue] = useState(String(content));
  const QuillRef = useRef<ReactQuill>();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (content && !initialFlag) {
      const parent = document.createElement("div");
      setValue(contentToHTML(content, parent).innerHTML);
    }
  }, [content, initialFlag]);

  useEffect(() => {
    if (value.length) {
      setFlag(true);
    }
    const convertToDom = new DOMParser().parseFromString(value, "text/html");
    const finalContent = HTMLtoContent(
      convertToDom.querySelector("body")?.childNodes || []
    );

    finalContent?.length && setContent(finalContent);
  }, [value]);

  // useEffect(() => {
  //   if(content && !flag){
  //     const parent = document.createElement("div");
  //     setValue(contentToHTML(content, parent).innerHTML);
  //   }
  // } , [flag])

  const imageHandler = () => {
    const reader = new FileReader();
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.onchange = async () => {
      if (input.files?.length) {
        const file: any = input.files[0];

        reader.onloadend = (res) => {
          // @ts-ignore
          const imageBase64 = res.currentTarget?.result;
          const container = document.getElementsByClassName("ql-editor");
          const createImage = document.createElement("img");
          createImage.setAttribute("src", imageBase64);
          createImage.setAttribute("alt", file.name);
          container[0].appendChild(createImage);
        };
        await reader.readAsDataURL(file);
      }
    };
  };

  return (
    <div className="">
      <header className="mb-5">
        <div onClick={() => imageHandler()}>
          <Image_Svg classname="w-6 h-6 cursor-pointer fill-lightBlack hover:fill-green1" />
        </div>
      </header>
      <div
        className={`[&_.ql-editor]:text-right [&_.ql-editor]:min-h-[360px] [&_.ql-editor]:h-[800px] [&_img]:w-3/4  [&_p]:text-lg [&_.ql-container]:font-normal`}
      >
        {isClient && document !== undefined ? (
          <ReactQuill
            ref={(element) => {
              if (element != null) {
                QuillRef.current = element;
              }
            }}
            style={{ fontFamily: "inherit" }}
            modules={{
              toolbar: {
                container: [
                  [
                    { header: "1" },
                    { header: "2" },
                    { header: "3" },
                    { font: [IRANYekanXFaNum.className] },
                  ],
                  [{ size: [12, 15] }],
                  ["bold", "italic", "underline", "strike", "blockquote"],
                  [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                  ],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              },
              clipboard: {
                matchVisual: false,
              },
            }}
            formats={[
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "link",
              "image",
              "video",
              "code-block",
            ]}
            theme="snow"
            value={value}
            onChange={setValue}
          />
        ) : null}
      </div>
    </div>
  );
}
