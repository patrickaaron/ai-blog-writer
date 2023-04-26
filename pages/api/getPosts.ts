import { getServerSession } from "next-auth";
import clientPromise from "../../lib/mongodb";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

type GetPostsReqBody = {
  lastPostDate: string;
  getNewerPosts: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    const client = await clientPromise;
    const db = client.db("BlogStandard");
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(session?.user.sub!) });

    const { lastPostDate, getNewerPosts } = req.body as GetPostsReqBody;

    const posts = await db
      .collection("posts")
      .find({
        userId: user?._id,
        created: { $lt: new Date(lastPostDate) },
      })
      .limit(5)
      .sort({ created: -1 })
      .toArray();

    res.status(200).json({ posts });
    return;
  } catch (e) {}
}
