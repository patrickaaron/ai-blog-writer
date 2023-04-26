import { MongoClient } from "mongodb";
import { Stripe } from "stripe";

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

declare module "stripe" {
  namespace Stripe {
    namespace Event {
      namespace Data {
        interface Object {
          metadata?: {
            sub: string;
          };
        }
      }
    }
  }
}
