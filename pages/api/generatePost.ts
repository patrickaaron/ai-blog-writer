import { Configuration, OpenAIApi } from "openai";
import clientPromise from "../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";

type GeneratePostReqBody = {
  topic: string;
  keywords: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const user = await db
    .collection("users")
    .findOne({ _id: new ObjectId(session?.user.sub!) });

  if (!user?.availableTokens) {
    res.status(403);
    return;
  }

  // OpenAI configuration
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(config);

  const { topic, keywords } = req.body as GeneratePostReqBody;

  if (!topic || !keywords) {
    res.status(422);
    return;
  }

  if (topic.length > 80 || keywords.length > 80) {
    res.status(422);
    return;
  }

  const postContentResult = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a blog post generator.",
      },
      {
        role: "user",
        content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}. 
      The response should be formatted in SEO-friendly HTML, 
      limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, i, ul, li, ol.`,
      },
    ],
    temperature: 0,
  });

  const postContent = postContentResult.data.choices[0]?.message?.content;

  const titleResult = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a blog post generator.",
      },
      {
        role: "user",
        content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}. 
      The response should be formatted in SEO-friendly HTML, 
      limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, i, ul, li, ol.`,
      },
      {
        role: "assistant",
        content: postContent!,
      },
      {
        role: "user",
        content: "Generate appropriate title tag text for the above blog post",
      },
    ],
    temperature: 0,
  });

  const metaDescriptionResult = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a blog post generator.",
      },
      {
        role: "user",
        content: `Write a long and detailed SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}. 
      The response should be formatted in SEO-friendly HTML, 
      limited to the following HTML tags: p, h1, h2, h3, h4, h5, h6, strong, i, ul, li, ol.`,
      },
      {
        role: "assistant",
        content: postContent!,
      },
      {
        role: "user",
        content:
          "Generate SEO-friendly meta description content for the above blog post",
      },
    ],
    temperature: 0,
  });

  const title = titleResult.data.choices[0]?.message?.content;
  const metaDescription =
    metaDescriptionResult.data.choices[0]?.message?.content;

  // Queries
  const post = await db.collection("posts").insertOne({
    postContent: postContent || "",
    title: title || "",
    metaDescription: metaDescription || "",
    topic,
    keywords,
    userId: user._id,
    created: new Date(),
  });

  await db.collection("users").updateOne(
    {
      _id: user._id,
    },
    { $inc: { availableTokens: -1 } }
  );

  res.status(200).json({
    postId: post.insertedId,
  });
}
