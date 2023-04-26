import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      tag?: string | null;
      sub?: string | null;
      availableTokens?: number | null;
    } & DefaultSession["user"];
  }
}
