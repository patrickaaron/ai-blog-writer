export { default } from "next-auth/middleware";

export const config = { matcher: ["/token-topup", "/post/new", "/success"] };
