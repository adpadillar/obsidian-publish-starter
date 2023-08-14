import type Author from "./author";

type PostType = {
  slug: string;
  excerpt: string;
  title: string;
  allowed: string[];
  content: string;
  date?: string;
  author?: Author;
  ogImage?: {
    url: string;
  };
};

export default PostType;
