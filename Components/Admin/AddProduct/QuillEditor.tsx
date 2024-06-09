import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import styles from "./MyComponent.module.css";

import { IRANYekanXFaNum } from "@/app/fonts";
import { Image_Svg } from "@/Components/SVGS";

export type contentType = {
  type: "image" | "text" | "title" | "break";
  content: string | { src: string; name: string };
};

interface Props {
  setContent: React.Dispatch<React.SetStateAction<contentType[]>>;
  content: contentType[];
}

export default function QuillEditor({ setContent }: Props) {
  const [value, setValue] = useState("");
  const QuillRef = useRef<ReactQuill>();
  useEffect(() => {
    const convertToDom = new DOMParser().parseFromString(value, "text/html");

    const temp: contentType[] = [];

    // convertToDom?.querySelectorAll("p").forEach((e) => {
    //   if (e.firstChild?.nodeName == "#text") {
    //     temp.push({ content: e.innerText, type: "text" });
    //   } else if (e.firstChild?.nodeName == "IMG") {
    //     // @ts-ignore
    //     temp.push({ content: e.firstChild.src || "", type: "image" });
    //   }
    // });

    convertToDom.body.childNodes.forEach((e) => {
      if (e.nodeName === "P") {
        if (e.firstChild?.nodeName === "#text") {
          temp.push({ content: e.firstChild.textContent || "", type: "text" });
          return;
        }
        if (e.firstChild?.nodeName === "IMG") {
          temp.push({
            content: {
              src:
                // @ts-ignore
                e.firstChild.src.replace("data:", "").replace(/^.+,/, "") || "",
              // @ts-ignore
              name: e.firstChild.alt,
            },
            type: "image",
          });
          return;
        }

        if (e.firstChild?.nodeName === "BR") {
          temp.push({ content: e.firstChild.textContent || "", type: "break" });
          return;
        }
      }
      console.log(e);
      if (e.nodeName.startsWith("H")) {
        temp.push({
          content: e.firstChild?.textContent || "",
          type: "title",
        });
        return;
      }
    });
    console.log(temp);
    setContent(temp);
  }, [value]);

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
          <Image_Svg classname="w-6 h-6 fill-lightBlack hover:fill-green1" />
        </div>
      </header>
      <div className={`[&_.ql-editor]:text-right [&_.ql-editor]:min-h-[360px] [&_img]:w-3/4  [&_p]:text-lg [&_.ql-container]:font-normal`}>
        <ReactQuill
          ref={(element) => {
            if (element != null) {
              QuillRef.current = element;
            }
          }}
          style={{fontFamily: "inherit"}}
          modules={{
            toolbar: {
              container: [
                [{ header: "1" }, { header: "2" }, { font: [IRANYekanXFaNum.className] }],
                [{ size: [12, 15] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                  { list: "ordered" },
                  { list: "bullet" },
                  { indent: "-1" },
                  { indent: "+1" },
                ],
                ["link", "image", "video"],
                ["code-block"],
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
      </div>
    </div>
  );
}
