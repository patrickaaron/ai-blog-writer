import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePostsContext } from "../../context/postsContext";
import { Logo } from "../Logo";

import { PostType } from "@/types/types";
import { signOut, useSession } from "next-auth/react";

type AppLayoutProps = {
  children: React.ReactNode;
  availableTokens: number;
  posts: PostType[];
  postId: string;
  // postCreated: string;
};

export const AppLayout = ({
  children,
  availableTokens,
  posts: postsFromSSR,
  postId,
}: // postCreated,
AppLayoutProps) => {
  const { data: session } = useSession();
  const { setPostsFromSSR, posts } = usePostsContext();

  useEffect(() => {
    setPostsFromSSR(postsFromSSR);
  }, [availableTokens]);

  return (
    <div className="grid grid-cols-[300px_1fr] h-screen max-h-screen">
      <div className="flex flex-col text-white overflow-hidden">
        <div className="bg-[#2C3E50] px-2">
          <Logo />
          <Link href="/post/new" className="btn">
            New Post
          </Link>
          <Link href="/token-topup" className="block mt-2 text-center">
            <FontAwesomeIcon icon={faCoins} className="text-yellow-500" />
            <span className="pl-1">{availableTokens} tokens available</span>
          </Link>
        </div>
        <div className="px-4 flex-1 overflow-auto bg-gradient-to-b from-[#2C3E50] to-black">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/post/${post._id}`}
              className={`py-1 border border-white/0 block text-ellipsis overflow-hidden whitespace-nowrap my-1 px-2 bg-white/10 cursor-pointer rounded-sm ${
                postId === post._id ? "bg-white/20 border-white" : ""
              }`}
            >
              {post.topic}
            </Link>
          ))}
        </div>
        <div className="bg-black flex items-center gap-2 border-t border-t-black/10 h-20 px-2">
          {!!session && (
            <>
              <div className="min-w-[50px]">
                <Image
                  src={session.user?.image!}
                  alt={session.user?.name!}
                  height={50}
                  width={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <div className="font-bold">{session.user?.email}</div>
                <div
                  className="text-sm hover:underline cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};
