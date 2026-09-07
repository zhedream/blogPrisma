import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createSchema, createYoga } from "graphql-yoga";
import { describe, expect, it } from "vitest";
import { resolvers } from "../src/resolvers.js";

const typeDefs = readFileSync(
  fileURLToPath(new URL("../src/schema/schema.graphql", import.meta.url)),
  "utf8"
);
const schema = createSchema({ typeDefs, resolvers });
const yoga = createYoga({ schema });

describe("GraphQL schema contract", () => {
  it("serves a database-free health query", async () => {
    const response = await yoga.fetch("http://localhost/graphql", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" })
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result).toEqual({ data: { __typename: "Query" } });
  });

  it("keeps the operations used by the blog client", () => {
    expect(Object.keys(schema.getQueryType()?.getFields() ?? {})).toEqual(
      expect.arrayContaining(["article", "articles", "tags", "categories"])
    );
    expect(Object.keys(schema.getMutationType()?.getFields() ?? {})).toEqual(
      expect.arrayContaining(["createArticle", "updateArticle", "deleteArticle"])
    );
  });
});
