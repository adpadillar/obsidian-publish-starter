import path from "path";

/**
 *
 * Function that makes sure we always get a string from
 * next's req.params["slug"]
 *
 * @param slug nextjs params.slug
 * @returns
 */
export const parseSlug = (slug: string | string[]) => {
  const slugArr: string[] = [];

  if (typeof slug === "string") {
    slugArr.push(slug);
  }

  if (Array.isArray(slug)) {
    slugArr.push(...slug);
  }

  return path.join(...slugArr);
};
