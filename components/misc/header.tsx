import Link from "next/link";
import { useEffect, useState } from "react";
import Search from "./search";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Header = () => {
  const auth = getAuth(app);
  const [user, loading] = useAuthState(auth);
  const [top, setTop] = useState(true);
  const [searching, setSearching] = useState(false);
  // detect whether user has scrolled the page down by 10px
  useEffect(() => {
    const scrollHandler = () => {
      window.pageYOffset > 10 ? setTop(false) : setTop(true);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  return (
    <header
      className={`fixed w-full z-30 md:bg-white/90 transition duration-300 ease-in-out ${
        !top && "bg-white backdrop-blur-sm shadow-lg"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div
          className={`flex items-center justify-between transition-all ${
            top ? "h-16 md:h-20" : "h-12 md:h-16"
          }`}
        >
          <div className="flex items-center md:space-x-6 space-x-3 w-full">
            <h2 className="shrink-0 md:text-2xl md:mr-2 mr-1 text-lg font-bold tracking-tight md:tracking-tighter leading-tight">
              <Link href="/" className="block hover:underline">
                axelpadilla.me
              </Link>
            </h2>
            <h2 className="shrink-0 md:text-lg text-base tracking-tight md:tracking-tighter leading-tight">
              <Link href="/home" className="block hover:underline">
                home
              </Link>
            </h2>
            <h2 className="shrink-0 md:text-lg text-base tracking-tight md:tracking-tighter leading-tight">
              <Link href="/Blog/posts" className="block hover:underline">
                blog
              </Link>
            </h2>
          </div>
          <ul className="flex space-x-3 grow justify-end items-center">
            {!loading && user && (
              <li>
                <button onClick={() => signOut(auth)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="48"
                    viewBox="0 -960 960 960"
                    width="48"
                    className="w-6 h-6 fill-current text-gray-400"
                  >
                    <path d="M180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h299v60H180v600h299v60H180Zm486-185-43-43 102-102H360v-60h363L621-612l43-43 176 176-174 174Z" />
                  </svg>
                </button>
              </li>
            )}
            <li>
              <button
                className="w-4 h-4 my-auto mx-2 border-black"
                aria-label="Search"
                onClick={() => setSearching(!searching)}
                disabled={searching}
              >
                <svg
                  className="w-4 h-4 fill-current text-gray-400"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 14c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zM7 2C4.243 2 2 4.243 2 7s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zM15.707 14.293L13.314 11.9a8.019 8.019 0 01-1.414 1.414l2.393 2.393a.997.997 0 001.414 0 .999.999 0 000-1.414z" />
                </svg>
              </button>
            </li>
          </ul>
          {/* Search */}
          <Search visible={searching} setVisible={setSearching} />
        </div>
      </div>
    </header>
  );
};

export default Header;
