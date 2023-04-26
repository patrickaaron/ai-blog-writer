import { ObjectId } from "mongodb";
import { WithId, Document } from "mongodb";
export type PostType = {
  postContent: string;
  title: string;
  metaDescription: string;
  topic: string;
  keywords: string;
  _id: string;
  created: string;
};
