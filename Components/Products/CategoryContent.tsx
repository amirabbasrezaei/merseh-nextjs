"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ContentViewer } from "../Admin/AddProduct/ContentViewer";
import type { contentType } from "../Admin/AddProduct/QuillEditor";

const COLLAPSED_HEIGHT_PX = 260;

function parseContent(raw: string): contentType[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as contentType[]) : [];
  } catch {
    return [];
  }
}

export default function CategoryContent({ content }: { content: string }) {
  const nodes = useMemo(() => parseContent(content), [content]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsible, setCollapsible] = useState(false);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const measure = () =>
      setCollapsible(body.scrollHeight > COLLAPSED_HEIGHT_PX + 40);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(body);
    return () => observer.disconnect();
  }, [nodes]);

  if (!nodes.length) return null;

  const clamped = collapsible && !expanded;

  return (
    <section
      aria-label="درباره این دسته‌بندی"
      className="flex flex-col gap-4 border-t border-hairline pt-10"
    >
      <div
        className="relative overflow-hidden"
        style={clamped ? { maxHeight: COLLAPSED_HEIGHT_PX } : undefined}
      >
        <div
          ref={bodyRef}
          className="flex max-w-4xl flex-col text-small leading-loose text-black1/75 [&_a]:text-mauve-700 [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-h2 [&_h2]:text-plum-900 first:[&_h2]:mt-0 [&_h3]:mb-1 [&_h3]:mt-4 [&_h3]:text-h3-md [&_h3]:text-plum-900 [&_ul]:my-2 [&_ul]:list-inside [&_ul]:list-disc"
        >
          <ContentViewer contentForView={nodes} />
        </div>
        {clamped ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
          />
        ) : null}
      </div>
      {collapsible ? (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="home-focus w-fit rounded-full bg-white px-5 py-2.5 text-small font-medium text-plum-900 ring-1 ring-hairline transition-colors hover:bg-blush-100 hover:ring-mauve-400"
        >
          {expanded ? "بستن" : "ادامه مطلب"}
        </button>
      ) : null}
    </section>
  );
}
