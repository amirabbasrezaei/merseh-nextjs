"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import classNames from "classnames";
import toast from "react-hot-toast";
import { Image_Svg } from "@/Components/SVGS";
import SelectProduct from "../Article/SelectProduct";
import { trpc } from "@/utils/trpc";

export type contentType = {
  type: Node["nodeName"];
  content:
    | string
    | {
        src?: string;
        name?: string;
        format?: string;
        fileId?: string;
      };
  childs?: contentType[] | null;
};

interface Props {
  setContent: React.Dispatch<React.SetStateAction<contentType[]>> | ((value: contentType[]) => void);
  content: contentType[];
  initialFlag?: boolean;
  folder?: "product/content" | "article/content";
}

const ContentImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) =>
          attributes.alt ? { alt: attributes.alt } : {},
      },
      "data-file-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-file-id"),
        renderHTML: (attributes) =>
          attributes["data-file-id"]
            ? { "data-file-id": attributes["data-file-id"] }
            : {},
      },
    };
  },
});

export const contentToHTML = (
  content: contentType[],
  parent: HTMLElement
): HTMLElement => {
  for (const ct of content) {
    if (!ct.childs?.length) {
      if (ct.type === "#text") {
        const element = document.createElement("p");
        element.innerHTML = ct.content as string;
        parent.append(element);
      } else if (ct.type === "img" && typeof ct.content !== "string") {
        const element = document.createElement("img");
        const src =
          ct.content.src &&
          (ct.content.src.startsWith("http://") ||
            ct.content.src.startsWith("https://") ||
            ct.content.src.startsWith("data:"))
            ? ct.content.src
            : ct.content.format !== undefined && ct.content.src
              ? `data:image/${ct.content.format},${ct.content.src}`
              : ct.content.src || "";
        element.src = src;
        element.alt = ct.content.name || "";
        if (ct.content.fileId) {
          element.setAttribute("data-file-id", ct.content.fileId);
        }
        parent.append(element);
      } else {
        const element = document.createElement(ct.type);
        element.innerHTML = ct.content as string;
        parent.append(element);
      }
    } else if (ct.type === "a" && typeof ct.content === "string") {
      const element = document.createElement(ct.type);
      element.href = ct.content;
      parent.append(contentToHTML(ct.childs, element));
    } else {
      const secParent = document.createElement(ct.type);
      parent.append(contentToHTML(ct.childs, secParent));
    }
  }
  return parent;
};

export const HTMLtoContent = (
  childNodes: NodeListOf<ChildNode> | []
): contentType[] | null => {
  if (!childNodes.length) return null;

  const result: contentType[] = [];
  childNodes.forEach((e) => {
    const imgChild =
      e.nodeName === "IMG"
        ? (e as HTMLImageElement)
        : e.firstChild?.nodeName === "IMG"
          ? (e.firstChild as HTMLImageElement)
          : null;

    if (imgChild) {
      const fileId = imgChild.getAttribute("data-file-id") || undefined;
      const src = imgChild.src || "";
      const isRemote =
        src.startsWith("http://") || src.startsWith("https://");
      result.push({
        content: {
          src: isRemote
            ? src
            : src.replace("data:", "").replace(/^.+,/, "") || "",
          name: imgChild.alt || "",
          format: !isRemote
            ? (src.split("/").at(1)?.split(",")[0] as string | undefined)
            : undefined,
          fileId,
        },
        type: "img",
        childs: null,
      });
      return;
    }

    if (e.nodeName === "A") {
      result.push({
        content: (e as HTMLAnchorElement).href,
        type: e.nodeName.toLowerCase(),
        childs: e.childNodes.length ? HTMLtoContent(e.childNodes) : null,
      });
      return;
    }

    result.push({
      content: e.nodeValue || "",
      type: e.nodeName.toLowerCase(),
      childs: HTMLtoContent(e.childNodes),
    });
  });

  return result;
};

function extractFileIdsFromHtml(html: string): Set<string> {
  const ids = new Set<string>();
  if (typeof document === "undefined") return ids;
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("img[data-file-id]").forEach((img) => {
    const id = img.getAttribute("data-file-id");
    if (id) ids.add(id);
  });
  return ids;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={classNames(
        "rounded-md px-2.5 py-1.5 text-sm font-medium border transition-colors disabled:opacity-40",
        active
          ? "bg-green2/10 text-green2 border-green2/20"
          : "border-transparent text-gray-600 hover:bg-white hover:border-gray-200"
      )}
    >
      {children}
    </button>
  );
}

export default function QuillEditor({
  setContent,
  content,
  initialFlag = false,
  folder = "product/content",
}: Props) {
  const [hydrated, setHydrated] = useState(initialFlag);
  const [uploading, setUploading] = useState(false);
  const prevFileIdsRef = useRef<Set<string>>(new Set());
  const skipNextUpdateRef = useRef(false);

  const uploadMutation = trpc.media.uploadContentImage.useMutation();
  const deleteMutation = trpc.media.deleteContentImage.useMutation();

  const syncFromHtml = useCallback(
    (html: string) => {
      const convertToDom = new DOMParser().parseFromString(html, "text/html");
      const finalContent = HTMLtoContent(
        convertToDom.querySelector("body")?.childNodes || []
      );

      const currentIds = extractFileIdsFromHtml(html);
      const removed = [...prevFileIdsRef.current].filter(
        (id) => !currentIds.has(id)
      );
      if (removed.length) {
        removed.forEach((fileId) => {
          deleteMutation.mutate(
            { fileId },
            {
              onError: () => toast.error("حذف تصویر از سرور ناموفق بود"),
            }
          );
        });
      }
      prevFileIdsRef.current = currentIds;
      if (finalContent?.length) setContent(finalContent);
      else setContent([]);
    },
    [deleteMutation, setContent]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      ContentImage.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "tiptap-editor min-h-[280px] max-h-[560px] overflow-y-auto outline-none text-right text-base leading-7 px-4 py-3 text-black1 [&_img]:w-3/4 [&_img]:mx-auto [&_img]:my-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pr-6 [&_ol]:pr-6",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor: current }) => {
      if (skipNextUpdateRef.current) {
        skipNextUpdateRef.current = false;
        return;
      }
      setHydrated(true);
      syncFromHtml(current.getHTML());
    },
  });

  useEffect(() => {
    setHydrated(initialFlag);
  }, [initialFlag]);

  useEffect(() => {
    if (!editor || hydrated) return;
    if (!content?.length) return;

    const parent = document.createElement("div");
    const html = contentToHTML(content, parent).innerHTML || "<p></p>";
    skipNextUpdateRef.current = true;
    editor.commands.setContent(html, { emitUpdate: false });
    prevFileIdsRef.current = extractFileIdsFromHtml(html);
    setHydrated(true);
  }, [editor, content, hydrated]);

  const insertImage = () => {
    if (!editor || uploading) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBase64 = reader.result as string | null;
        if (!imageBase64) return;
        setUploading(true);
        try {
          const uploaded = await uploadMutation.mutateAsync({
            base64: imageBase64,
            name: file.name,
            folder,
          });
          editor
            .chain()
            .focus()
            .setImage({
              src: uploaded.url,
              alt: uploaded.name || file.name,
              "data-file-id": uploaded.fileId,
            } as any)
            .run();
          prevFileIdsRef.current.add(uploaded.fileId);
          toast.success("تصویر آپلود شد");
        } catch {
          toast.error("آپلود تصویر ناموفق بود");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    };
  };

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("آدرس لینک", previous || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertCtaHtml = (html: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(html).run();
  };

  if (!editor) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-base text-lightBlack">
        در حال بارگذاری ویرایشگر…
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-row flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/80 p-2">
        <ToolbarButton
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          Underline
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          Strike
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          لیست
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          شماره‌دار
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          نقل‌قول
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} onClick={setLink}>
          لینک
        </ToolbarButton>
        <ToolbarButton disabled={uploading} onClick={insertImage}>
          <span className="inline-flex items-center gap-1">
            <Image_Svg classname="w-4 h-4 fill-current" />
            تصویر
          </span>
        </ToolbarButton>
        <SelectProduct onInsert={insertCtaHtml} />
        {uploading ? (
          <span className="px-2 text-sm text-lightBlack">
            در حال آپلود تصویر…
          </span>
        ) : null}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
