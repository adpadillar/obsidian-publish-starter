import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeRewrite from "rehype-rewrite";
import rehypeStringify from "rehype-stringify";
import remarkMath from "remark-math";
import rehypeMathJaxSvg from "rehype-mathjax";
import rehypeRaw from "rehype-raw";
import {
  getLinksMapping,
  getPostBySlug,
  getSlugFromHref,
  updateMarkdownLinks,
} from "./api";
import removeMd from "remove-markdown";
import { Element } from "hast-util-select";
import { renderToStaticMarkup } from "react-dom/server";
import NotePreview from "../components/misc/note-preview";
import { fromHtml } from "hast-util-from-html";

export async function markdownToHtml(markdown: string, currSlug: string) {
  markdown = updateMarkdownLinks(markdown, currSlug);

  // get mapping of current links
  const links = getLinksMapping()[currSlug] as string[];
  const linkNodeMapping = new Map<string, Element>();
  for (const l of links) {
    const post = getPostBySlug(l, ["title", "content"]);
    const node = createNoteNode(post.title, post.content);
    linkNodeMapping[l] = node;
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(rehypeRaw)
    .use(remarkMath)
    .use(rehypeRewrite, {
      selector: "a, span.math-inline, div.math-display",
      rewrite: async (node) => {
        if (node.type === "element") {
          if (node.tagName === "a") {
            return rewriteLinkNodes(node, linkNodeMapping, currSlug);
          } else {
            node.children.forEach((child) => {
              const typedChild = child as typeof child & { value: string };

              const beginRegex = /\\begin*{.*}/g;
              const endRegex = /\\end*{.*}/g;
              const problematicSymbols = [
                "_",
                "*",
                ">",
                "<",
                beginRegex,
                endRegex,
              ];
              problematicSymbols.forEach((s) => {
                if (typeof s === "string") {
                  typedChild.value = typedChild.value.replaceAll(`\\${s}`, s);
                  return;
                }

                typedChild.value = typedChild.value.replaceAll(s, (subs) => {
                  return subs.replace("\\", "");
                });
              });
            });
          }
        }
      },
    })
    .use(rehypePrettyCode, {
      theme: "one-dark-pro",
    })
    .use(rehypeStringify)
    .use(rehypeMathJaxSvg, {})
    .process(markdown);
  let htmlStr = file.toString();
  return htmlStr;
}

export function getMDExcerpt(markdown: string, length: number = 500) {
  const text = removeMd(markdown, {
    stripListLeaders: false,
    gfm: true,
  }) as string;
  return text.slice(0, length).trim();
}

export function createNoteNode(title: string, content: string) {
  const mdContentStr = getMDExcerpt(content);
  const htmlStr = renderToStaticMarkup(
    NotePreview({ title, content: mdContentStr })
  );
  const noteNode = fromHtml(htmlStr);
  return noteNode;
}

function rewriteLinkNodes(node, linkNodeMapping: Map<string, any>, currSlug) {
  if (node.type === "element" && node.tagName === "a") {
    const slug = getSlugFromHref(currSlug, node.properties.href);
    const noteCardNode = linkNodeMapping[slug];
    if (noteCardNode) {
      const anchorNode = { ...node };
      anchorNode.properties.className = "internal-link";
      node.tagName = "span";
      node.properties = { className: "internal-link-container" };
      node.children = [anchorNode, noteCardNode];
    }
  }
}
