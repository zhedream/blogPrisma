import { readFileSync } from "node:fs";
import { createSchema, createYoga } from "graphql-yoga";
import { afterEach, describe, expect, it, vi } from "vitest";
import { isAdmin } from "../src/auth.js";
import { resolvers } from "../src/resolvers.js";

const typeDefs = readFileSync(new URL("../src/schema/schema.graphql", import.meta.url), "utf8");
const schema = createSchema({ typeDefs, resolvers });
const key = "test-only-random-admin-key-01234567890123456789";
const article = { id: "article-1", title: "draft", isPublished: false, tags: [], type: null };

function fixture(admin = false) {
  const prisma = {
    article: {
      findUnique: vi.fn().mockResolvedValue(article),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockImplementation(({ data }) => ({ ...article, ...data })),
      update: vi.fn().mockImplementation(({ data }) => ({ ...article, ...data })),
      updateMany: vi.fn().mockResolvedValue({ count: 2 })
    },
    tag: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null) },
    category: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue(null) },
    $transaction: (items: unknown[]) => Promise.all(items)
  };
  const yoga = createYoga({ schema, context: { prisma, isAdmin: admin } as never, maskedErrors: false });
  async function run(query: string, variables = {}) {
    return (await yoga.fetch("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query, variables })
    })).json() as any;
  }
  return { prisma, run };
}

afterEach(() => vi.unstubAllEnvs());

describe("administrator boundary", () => {
  it("fails closed and validates the complete bearer token", () => {
    vi.stubEnv("ADMIN_API_TOKEN", "");
    expect(isAdmin(new Request("https://local"))).toBe(false);
    vi.stubEnv("ADMIN_API_TOKEN", "short");
    expect(isAdmin(new Request("https://local", { headers: { authorization: "Bearer short" } }))).toBe(false);
    vi.stubEnv("ADMIN_API_TOKEN", key);
    for (const token of ["", "Bearer wrong", `Basic ${key}`, `Bearer ${key}x`]) {
      expect(isAdmin(new Request("https://local", { headers: { authorization: token } }))).toBe(false);
    }
    expect(isAdmin(new Request("https://local", { headers: { authorization: `Bearer ${key}` } }))).toBe(true);
  });

  it("protects every mutation before touching the database", () => {
    for (const resolve of Object.values(resolvers.Mutation)) {
      const context = { isAdmin: false, get prisma(): never { throw new Error("DATABASE ACCESSED"); } };
      expect(() => resolve(null, {}, context as never)).toThrow("请登录");
    }
  });

  it("verifies the session without requiring a database connection", async () => {
    expect((await fixture().run("{ loggedIn: adminSession }")).errors[0].extensions.code).toBe("UNAUTHENTICATED");
    expect(await fixture(true).run("{ adminSession }")).toEqual({ data: { adminSession: true } });
  });

  it("hides drafts from anonymous single and list queries", async () => {
    const anonymous = fixture();
    expect((await anonymous.run('{ article(where: {id:"article-1"}) { id } }')).data.article).toBeNull();
    await anonymous.run('{ articles(where: {OR: [{isPublished:false},{title_contains:"draft"}]}) { id } articlesConnection(where:{isPublished:false}) { aggregate {count} } }');
    expect(anonymous.prisma.article.findMany.mock.calls[0][0].where.AND[1]).toEqual({ isPublished: true });
    expect(anonymous.prisma.article.findMany.mock.calls[0][0].where.AND[0].OR[1]).toEqual({ title: { contains: "draft" } });
    expect(anonymous.prisma.article.count.mock.calls[0][0].where.AND[1]).toEqual({ isPublished: true });
    expect((await fixture(true).run('{ article(where: {id:"article-1"}) { id } }')).data.article.id).toBe("article-1");
  });

  it("maps modern article relations for create and update", async () => {
    const { run, prisma } = fixture(true);
    const created = await run("mutation($data:ArticleCreateInput!){createArticle(data:$data){id}}", {
      data: { title: "New", typeId: "c1", tagIds: ["t1"] }
    });
    expect(created.errors).toBeUndefined();
    expect(prisma.article.create.mock.calls[0][0].data).toMatchObject({
      type: { connect: { id: "c1" } }, tags: { connect: [{ id: "t1" }] }
    });
    await run('mutation($data:ArticleUpdateInput!){updateArticle(where:{id:"article-1"},data:$data){id}}', {
      data: { typeId: null, tagIds: [] }
    });
    expect(prisma.article.update.mock.calls[0][0].data).toEqual({ type: { disconnect: true }, tags: { set: [] } });
  });

  it("rejects anonymous writes and permits authenticated batch publishing", async () => {
    expect((await fixture().run("mutation {deleteManyArticles {count}}")).errors[0].extensions.code).toBe("UNAUTHENTICATED");
    const { run, prisma } = fixture(true);
    const result = await run('mutation {updateManyArticles(where:{OR:[{id:"a"},{id:"b"}]},data:{isPublished:true}){count}}');
    expect(result.data.updateManyArticles.count).toBe(2);
    expect(prisma.article.updateMany.mock.calls[0][0].where).toEqual({ OR: [{ id: "a" }, { id: "b" }] });
  });
});
