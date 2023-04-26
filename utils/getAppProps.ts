import clientPromise from "../lib/mongodb";
import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { PostType } from "@/types/types";
import { Session } from "next-auth";

export const getAppProps = async (
  session: Session,
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const user = await db.collection("users").findOne({
    email: session.user?.email,
  });

  if (user && !user.availableTokens) {
    return {
      availableTokens: 0,
      posts: [] as PostType[],
    };
  }

  const posts = await db
    .collection("posts")
    .find({ userId: user?._id })
    .sort({ created: -1 })
    .toArray();

  // const postsLength = await db.collection("posts").countDocuments();

  return {
    availableTokens: user?.availableTokens as number,
    posts: posts.map(({ created, _id, userId, ...rest }) => ({
      _id: _id.toString(),
      created: created.toString(),
      ...rest,
    })),
    postId: ctx.params?.postId || null,
  };
};
