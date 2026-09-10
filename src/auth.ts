import { createHash, timingSafeEqual } from "node:crypto";
import { GraphQLError } from "graphql";

// A high-entropy, server-owned key. Missing/short configuration always fails closed.
export function isAdmin(request?: Request): boolean {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected || expected.length < 32 || !request) return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ") || header.length > 1024) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(header.slice(7)), digest(expected));
}

export function requireAdmin(context: { isAdmin?: boolean }): void {
  if (!context.isAdmin) throw new GraphQLError("请登录管理员账户后再操作", {
    extensions: { code: "UNAUTHENTICATED" }
  });
}
