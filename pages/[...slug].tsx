import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import PostType from "../interfaces/post";
import { useRouter } from "next/router";
import ErrorPage from "next/error";
import path from "path";
import {
  getAllPosts,
  getBacklinks,
  getLinksMapping,
  getPostBySlug,
} from "../lib/api";
import { parseSlug } from "../lib/utils/parseSlug";
import Layout from "../components/misc/layout";
import { NextSeo } from "next-seo";
import PostSingle from "../components/blog/post-single";

interface NotePageProps {
  children?: React.ReactNode;
  post: PostType;
  backlinks: {
    [k: string]: {
      title: string;
      excerpt: string;
    };
  };
}

const NotePage: NextPage<NotePageProps> = ({ backlinks, post, children }) => {
  const router = useRouter();
  const description = post.excerpt.slice(0, 155);

  const notFound = !router.isFallback && !post;

  if (notFound) return <ErrorPage statusCode={404} />;

  return (
    <>
      {router.isFallback ? (
        <h1>Loading…</h1>
      ) : (
        <Layout>
          <NextSeo
            title={post.title}
            description={description}
            openGraph={{
              title: post.title,
              description,
              type: "article",
              images: [
                {
                  url: post.ogImage?.url
                    ? post.ogImage.url
                    : "https://fleetingnotes.app/favicon/512.png",
                  width: post.ogImage?.url ? null : 512,
                  height: post.ogImage?.url ? null : 512,
                  type: null,
                },
              ],
            }}
          />
          <PostSingle
            title={post.title}
            content={post.content}
            date={post.date}
            author={post.author}
            backlinks={backlinks}
          />
        </Layout>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps<NotePageProps> = ({ params }) => {
  const slug = parseSlug(params.slug);
  const post = getPostBySlug(slug, [
    "title",
    "excerpt",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
  ]);

  const linkMapping = getLinksMapping();
  const backlinksSlugs = getBacklinks(linkMapping, post.slug);

  const backlinks = Object.fromEntries(
    backlinksSlugs.map((slug) => {
      const post = getPostBySlug(slug, ["title", "excerpt"]);
      return [slug, post];
    })
  );

  console.log(backlinks);

  return {
    props: {
      post,
      backlinks,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = getAllPosts(["slug"]);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug.split(path.sep),
        },
      };
    }),
    fallback: false,
  };
};

export default NotePage;
