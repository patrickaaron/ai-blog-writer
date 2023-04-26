import { buffer } from "micro";
import Stripe from "stripe";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const buff = await buffer(req);
    const signature = req.headers["stripe-signature"];

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buff, signature!, webhookSecret);
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const client = await clientPromise;
        const db = client.db("BlogStandard");

        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.sub;

        const user = await db.collection("users").updateOne(
          {
            _id: new ObjectId(userId),
          },
          {
            $inc: {
              availableTokens: 50,
            },
          },
          {
            upsert: true,
          }
        );
        break;
      }
      default:
        console.log("UNHANDLED EVENT: ", event.type);
    }
    res.status(200).json({ received: true });
  }
}
