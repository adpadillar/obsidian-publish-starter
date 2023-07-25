import { useEffect, useRef, useState } from "react";
import PostPreview from "../blog/post-preview";
import { useRouter } from "next/router";

function useOutsideAlerter(ref, callback) {
  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    }
    // Bind the event listener
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, [ref]);
}

function Search({ visible, setVisible }) {
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus();
    }
  }, [visible]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        setVisible(true);
      }
      if (e.key === "Escape") {
        setVisible(false);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  useOutsideAlerter(containerRef, (e: MouseEvent) => {
    setVisible(false);
    e.stopPropagation();
  });

  useEffect(() => {
    setVisible(false);
  }, [router.asPath]);

  async function handleChangeInput(e) {
    setFetching(true);
    const res = await fetch(`/api/search?q=${e.target.value}`);
    const json = await res.json();
    setFetching(false);
    setSearchResults(json);
  }

  return (
    <div
      className={`absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-y-auto overscroll-none overflow-x-hidden bg-white/95 ${
        visible ? "block" : "hidden"
      }`}
    >
      <div
        ref={containerRef}
        className="max-w-4xl mx-auto flex flex-wrap mt-5 px-5"
      >
        {/* Search Bar */}
        <div className="w-full">
          <label className="block text-sm sr-only" htmlFor="search">
            Search
          </label>
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              id="search"
              type="search"
              className="form-input w-full text-gray-800 px-3 py-2 pl-10"
              placeholder="Search axelpadilla.me"
              onChange={handleChangeInput}
            />
            <button
              type="submit"
              className="absolute inset-0 right-auto"
              aria-label="Search"
            >
              <svg
                className="w-4 h-4 fill-current text-gray-400 mx-3 shrink-0"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
              </svg>
            </button>
          </div>
        </div>

        {fetching && (
          <div role="status" className="w-full flex justify-center py-3">
            <svg
              aria-hidden="true"
              className="w-8 h-8 mr-2 text-gray-600 animate-spin dark:text-gray-200 fill-gray-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        )}
        {/* Search Results */}
        {searchResults.map((res) => (
          <PostPreview
            key={res.item.slug}
            title={res.item.title}
            excerpt={res.item.excerpt}
            slug={res.item.slug}
            date={res.item.date}
            author={res.item.author}
          />
        ))}
      </div>
    </div>
  );
}

export default Search;
