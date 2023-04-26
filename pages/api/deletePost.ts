import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

type DeletePostReqBody = { postId: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);

    const client = await clientPromise;
    const db = client.db("BlogStandard");
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session?.user.sub!),
    });

    const { postId } = req.body as DeletePostReqBody;

    const result = await db.collection("posts").deleteOne({
      userId: user?._id,
      _id: new ObjectId(postId),
    });

    if (result.deletedCount === 1) {
      res
        .status(202)
        .json({ message: "Post deleted successfully", status: "success" });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}
