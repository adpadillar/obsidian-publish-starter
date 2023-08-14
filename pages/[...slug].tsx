import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getPostBySlug, getAllPosts, getLinksMapping } from "../lib/api";
import { markdownToHtml } from "../lib/markdownToHtml";
import type PostType from "../interfaces/post";
import path from "path";
import PostSingle from "../components/blog/post-single";
import Layout from "../components/misc/layout";
import { NextSeo } from "next-seo";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { app } from "../lib/firebase";
import Link from "next/link";
import PreviewLink from "../components/misc/preview-link";

type Items = {
  title: string;
  excerpt: string;
};

type Props = {
  post: PostType;
  slug: string;
  backlinks: { [k: string]: Items };
};

export default function Post({ post, backlinks }: Props) {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const description = post.excerpt.slice(0, 155);

  if (!post.allowed.includes("*")) {
    // Page is not allowed to be viewed by everyone
    if (loading) {
      return (
        <div className="bg-gray-50 w-full min-h-screen flex items-center justify-center">
          <div className="flex flex-col space-y-4 items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-black animate-bounce" />
            <strong>Loading...</strong>
          </div>
        </div>
      );
    } else {
      if (!user) {
        return (
          <Layout>
            <div className="w-full min-h-screen flex items-center justify-center flex-col space-y-6">
              <h2 className="font-black text-4xl">No Account Detected</h2>

              <div className="flex space-x-4 text-xl">
                <PreviewLink href="/home">Go Home</PreviewLink>

                <button
                  onClick={() =>
                    signInWithPopup(auth, new GoogleAuthProvider())
                  }
                >
                  Sign in
                </button>
              </div>
            </div>
          </Layout>
        );
      } else {
        if (!post.allowed.includes(user.email)) {
          return (
            <Layout>
              <div className="w-full min-h-screen flex items-center justify-center flex-col space-y-6">
                <h2 className="font-black text-4xl">
                  Your account is not allowed
                </h2>

                <div className="flex space-x-4 text-xl">
                  <PreviewLink href="/home">Go Home</PreviewLink>

                  <button onClick={() => signOut(auth)}>Sign Out</button>
                </div>
              </div>
            </Layout>
          );
        }
      }
    }
  }

  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />;
  }
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
}

type Params = {
  params: {
    slug: string[];
    backlinks: string[];
  };
};

export async function getStaticProps({ params }: Params) {
  const slug = path.join(...params.slug);
  const post = await getPostBySlug(slug, [
    "title",
    "excerpt",
    "date",
    "slug",
    "author",
    "content",
    "ogImage",
    "allowed",
  ]);

  if (!post.allowed) {
    return {
      notFound: true,
    };
  }

  const content = await markdownToHtml(post.content || "", slug);
  const linkMapping = await getLinksMapping();
  const backlinks = Object.keys(linkMapping).filter(
    (k) => linkMapping[k].includes(post.slug) && k !== post.slug
  );
  const backlinkNodes = Object.fromEntries(
    await Promise.all(
      backlinks.map(async (slug) => {
        const post = await getPostBySlug(slug, ["title", "excerpt"]);
        return [slug, post];
      })
    )
  );

  return {
    props: {
      post: {
        ...post,
        content,
      },
      backlinks: backlinkNodes,
    },
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts(["slug"]);
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
}
