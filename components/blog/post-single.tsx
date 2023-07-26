import React from "react";
import Author from "../../interfaces/author";
import Backlinks from "../misc/backlinks";
import PostBody from "./post-body";
import PostMeta from "./post-meta";
import Balancer from "react-wrap-balancer";

type Props = {
  title: string;
  content: string;
  date?: string;
  author?: Author;
  backlinks: {
    [k: string]: {
      title: string;
      excerpt: string;
    };
  };
};

function PostSingle({ title, date, author, content, backlinks }: Props) {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          <div className="max-w-3xl mx-auto lg:max-w-none">
            <article>
              {/* Article header */}
              <header className="max-w-3xl mb-20">
                {/* Title */}
                <h1 className="h1 text-left mb-4 md:text-6xl text-4xl">
                  <Balancer>{title}</Balancer>
                </h1>
              </header>

              {/* Article content */}
              <div className="lg:flex lg:justify-between" data-sticky-container>
                {/* Main content */}
                <div className="w-full">
                  {/* Article meta */}
                  {(author || date) && (
                    <>
                      <PostMeta author={author} date={date} />
                      <hr className="w-16 h-px pt-px bg-gray-200 border-0 my-6" />
                    </>
                  )}

                  {/* Article body */}
                  <PostBody content={content} />
                </div>

                {/* Sidebar */}
                <hr className="my-10 border border-dashed lg:block" />
                <aside className="relative lg:block lg:w-72 lg:ml-20 shrink-0">
                  <div>
                    <h4 className="text-lg font-bold leading-snug tracking-tight mb-4">
                      Backlinks
                    </h4>
                    <div className="grid grid-cols-1 gap-4 max-h-max lg:max-h-[32rem] overflow-y-scroll">
                      {Object.keys(backlinks).length > 0 && (
                        <div>
                          <p className="text-gray-600 pb-4">
                            Found {Object.keys(backlinks).length} backlink
                            {Object.keys(backlinks).length !== 1 && "s"}.
                          </p>
                          <Backlinks backlinks={backlinks} />
                        </div>
                      )}
                      {Object.keys(backlinks).length === 0 && (
                        <p className="text-gray-600">No backlinks yet.</p>
                      )}
                    </div>
                  </div>
                </aside>
              </div>

              {/* Article footer */}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostSingle;
