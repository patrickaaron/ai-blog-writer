import { faHashtag } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ObjectId } from "mongodb";
import { useRouter } from "next/router";
import { useState } from "react";
import { usePostsContext } from "@/context/postsContext";
import { AppLayout } from "@/components/AppLayout";
import clientPromise from "@/lib/mongodb";
import { getAppProps } from "@/utils/getAppProps";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]";

type PostProps = {
  id: string;
  postContent: string;
  title: string;
  metaDescription: string;
  keywords: string;
  postCreated: string;
};

export default function Post(props: PostProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deletePost } = usePostsContext();

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch("/api/deletePost", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ postId: props.id }),
      });

      const json = (await response.json()) as {
        message: string;
        status: string;
      };
      if (json.status === "success") {
        deletePost(props.id);
        router.replace("/post/new");
      }
    } catch (e) {}
  };

  return (
    <div className="overflow-auto h-full">
      <div className="max-w-screen-sm mx-auto">
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          SEO title and meta description
        </div>
        <div className="p-4 my-2 border border-stone-200 rounded-md">
          <div className="text-blue-600 text-2xl font-bold">{props.title}</div>
          <div className="mt-2">{props.metaDescription}</div>
        </div>
        <div className="text-sm-font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Keywords
        </div>
        <div className="flex flex-wrap pt-2 gap-1">
          {props.keywords.split(",").map((keyword, i) => (
            <div key={i} className="p-2 rounded-full bg-[#2C3E50] text-white">
              <FontAwesomeIcon icon={faHashtag} /> {keyword}
            </div>
          ))}
        </div>
        <div className="text-sm font-bold mt-6 p-2 bg-stone-200 rounded-sm">
          Blog post
        </div>
        <div dangerouslySetInnerHTML={{ __html: props.postContent || "" }} />
        <div className="my-4">
          {!showDeleteConfirm && (
            <button
              className="btn bg-red-600 hover:bg-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete post
            </button>
          )}
          {!!showDeleteConfirm && (
            <div>
              <p className="p-2 bg-red-300 text-center">
                Are you sure you want to delete this post? This action is
                irreversible
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="btn bg-stone-600 hover:bg-stone-700"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  cancel
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700"
                  onClick={handleDeleteConfirm}
                >
                  confirm delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Post.getLayout = function getLayout(page: React.ReactNode, pageProps: any) {
  return <AppLayout {...pageProps}>{page}</AppLayout>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const props = await getAppProps(session!, ctx);

  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const user = await db.collection("users").findOne({
    _id: new ObjectId(session?.user.sub!),
  });
  const post = await db.collection("posts").findOne({
    _id: new ObjectId(ctx.params?.postId as string),
    userId: user?._id,
  });

  if (!post) {
    return {
      redirect: {
        destination: "/post/new",
        permanent: false,
      },
    };
  }

  return {
    props: {
      id: ctx.params?.postId,
      postContent: post.postContent,
      title: post.title,
      metaDescription: post.metaDescription,
      keywords: post.keywords,
      postCreated: post.created.toString(),
      ...props,
    },
  };
};
