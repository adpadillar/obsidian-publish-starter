import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getFilesRecursively } from "./modules/find-files-recusively.mjs";
import { getMDExcerpt } from "./markdownToHtml";
import PostType from "../interfaces/post";

const mdDir = path.join(process.cwd(), process.env.COMMON_MD_DIR);

/**
 * Returns an inferred post object from a markdown file
 *
 * @example
 * ```ts
 * const post = getPostBySlug("my-post", ["title", "excerpt"]);
 * //      ^ { title: string, excerpt: string }
 * ```
 *
 * @param slug the slug of the post
 * @param fields the fields to return
 * @returns Pick<PostType, T>
 */
export const getPostBySlug = <T extends keyof PostType>(
  slug: string,
  fields: T[]
): Pick<PostType, T> => {
  const realSlug = slug.replace(/\.md$/, "");
  const data = parseFileToObj(realSlug);

  // Create a new object with only the specified fields
  const selectedFields = {} as Pick<PostType, T>;
  fields.forEach((field) => {
    selectedFields[field] = data[field];
  });

  return selectedFields;
};

/**
 * Returns all fields of a post object from a markdown file
 *
 * @example
 * ```ts
 * const post = getPostBySlug("my-folder/my-post");
 * //      ^ PostType
 * ```
 *
 * @param fullSlug the full slug of the post
 * @returns PostType
 */
const parseFileToObj = (fullSlug: string) => {
  const fullPath = path.join(mdDir, `${fullSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const postData: PostType = {
    slug: fullSlug,
    content: content,
    author: {
      name: data["author"]?.name || "",
      picture: data["author"]?.picture || "",
    },
    date: data["date"] || "",
    ogImage: {
      url: data["ogImage"]?.url || "",
    },
    excerpt: data["excerpt"] || getMDExcerpt(content, 500),
    title: data["title"] || decodeURI(path.basename(fullPath, ".md")),
  };

  return postData;
};

/**
 *
 * Get all posts from the markdown directory with the specified fields
 *
 * @param fields the fields to return (we always return date for sorting)
 * @returns
 */
export const getAllPosts = <T extends keyof PostType>(fields: T[] = []) => {
  let files = getFilesRecursively(mdDir, /\.md/);
  let posts = files
    .map((slug) => getPostBySlug(slug, [...fields, "date"])) // We add date for sorting
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));

  return posts;
};

/**
 * @example
 * ```ts
 * const linkMapping = getLinksMapping();
 * //      ^ Map<string, string[]>
 * ```
 *
 * @returns a map of slugs to an array of slugs that are linked to in the content
 */
export const getLinksMapping = () => {
  const linksMapping = new Map<string, string[]>();
  const postsMapping = new Map(
    getAllPosts(["slug", "content"]).map((i) => [i.slug, i.content])
    //                                          [key, value]
  );

  const allSlugs = new Set(postsMapping.keys());
  postsMapping.forEach((content, slug) => {
    const mdLink = /\[[^\[\]]+\]\(([^\(\)]+)\)/g;
    const matches = Array.from(content.matchAll(mdLink));
    const linkSlugs = [];
    for (var m of matches) {
      const linkSlug = getSlugFromHref(slug, m[1]);
      if (allSlugs.has(linkSlug)) {
        linkSlugs.push(linkSlug);
      }
    }
    linksMapping[slug] = linkSlugs;
  });

  return linksMapping;
};

/**
 *
 * Gets the backlinks for a given slug
 *
 * @param linkMapping getLinksMapping()
 * @param slug string
 * @returns the backlinks for a given slug
 */
export const getBacklinks = (
  linkMapping: Map<string, string[]>,
  slug: string
) =>
  Object.keys(linkMapping).filter((k) => {
    return linkMapping[k].includes(slug) && k !== slug;
  });

/**
 *
 * Gets the outgoing links for a given slug
 *
 * @param linkMapping getLinksMapping()
 * @param slug string
 * @returns the outgoing links for a given slug
 */
export const getOutgoingLinks = (
  linkMapping: Map<string, string[]>,
  slug: string
) => linkMapping.get(slug) || [];

/**
 *
 * Gets the slug of a markdown file from a link
 *
 * @param slug the slug of the markdown file
 * @param href the href of the link
 * @returns
 */
export function getSlugFromHref(slug: string, href: string) {
  return decodeURI(
    path.join(...slug.split(path.sep).slice(0, -1), href)
  ).replace(/\.md$/, "");
}

/**
 *
 * @param markdown a markdown string
 * @param slug the slug of the markdown file
 * @returns a markdownString with links rewritten to be relative to the root of the site
 */
export const rewriteMarkdownLinks = (markdown: string, slug: string) => {
  // remove `.md` from links
  markdown = markdown.replaceAll(/(\[[^\[\]]+\]\([^\(\)]+)(\.md)(\))/g, "$1$3");

  // update image links
  markdown = markdown.replaceAll(
    /(\[[^\[\]]*\]\()([^\(\)]+)(\))/g,
    (m, m1, m2: string, m3) => {
      const slugDir = path.join(...slug.split(path.sep).slice(0, -1));
      let relLink = m2;
      if (!m2.startsWith(slugDir)) {
        relLink = path.join(slugDir, m2);
      }
      const relAssetDir = path.relative("./public", process.env.MD_ASSET_DIR);
      const fileSlugRel = decodeURI(path.join(mdDir, relLink));
      const fileSlugAbs = decodeURI(path.join(mdDir, m2));
      if (fs.existsSync(fileSlugRel)) {
        const imgPath = path.join(relAssetDir, relLink);
        return `${m1}/${imgPath}${m3}`;
      } else if (fs.existsSync(fileSlugAbs)) {
        const imgPath = path.join(relAssetDir, m2);
        return `${m1}/${imgPath}${m3}`;
      }
      return m;
    }
  );
  return markdown;
};
