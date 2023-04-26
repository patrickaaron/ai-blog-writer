import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { Stripe } from "stripe";
import { authOptions } from "./auth/[...nextauth]";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const lineItems = [
    {
      price: process.env.STRIPE_PRODUCT_PRICE_ID,
      quantity: 1,
    },
  ];

  const protocol =
    process.env.NODE_ENV === "development" ? "http://" : "https://";
  const host = req.headers.host;

  const checkoutSession: Stripe.Checkout.Session =
    await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${protocol}${host}/success`,
      payment_intent_data: {
        metadata: {
          sub: session?.user.sub!,
        },
      },
      metadata: {
        sub: session?.user.sub!,
      },
    });

  // console.log("user: ", user);

  res.status(200).json({ session: checkoutSession });
}
