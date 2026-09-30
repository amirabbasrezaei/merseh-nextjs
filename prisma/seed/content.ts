import type { ContentNode } from "./types";

function textNode(type: string, value: string): ContentNode {
  return {
    type,
    content: "",
    childs: [{ type: "#text", content: value, childs: null }],
  };
}

function listNode(items: string[]): ContentNode {
  return {
    type: "ul",
    content: "",
    childs: items.map((item) => textNode("li", item)),
  };
}

export function richContent(
  sections: Array<{
    heading?: string;
    paragraphs?: string[];
    list?: string[];
  }>
): string {
  const nodes: ContentNode[] = [];

  for (const section of sections) {
    if (section.heading) {
      nodes.push(textNode("h2", section.heading));
    }
    for (const paragraph of section.paragraphs ?? []) {
      nodes.push(textNode("p", paragraph));
    }
    if (section.list?.length) {
      nodes.push(listNode(section.list));
    }
  }

  return JSON.stringify(nodes);
}
