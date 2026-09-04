import "dotenv/config";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { createSchema, createYoga } from "graphql-yoga";
import { PrismaClient } from "./generated/prisma/client.js";
import { resolvers } from "./resolvers.js";

let prisma: PrismaClient | undefined;

function getPrisma() {
  if (prisma) return prisma;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required for GraphQL requests");

  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 3)
  });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

const typeDefs = readFileSync(fileURLToPath(new URL("./schema/schema.graphql", import.meta.url)), "utf8");
const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  schema: createSchema({ typeDefs, resolvers }),
  context: () => ({ prisma: getPrisma() }),
  graphiql: process.env.NODE_ENV !== "production",
  disposeOnProcessTerminate: true
});

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }
  return yoga(request, response);
});
const port = Number(process.env.PORT || 7200);
server.listen(port, () => console.info(`GraphQL API ready at http://localhost:${port}/graphql`));

async function shutdown() {
  server.close();
  await prisma?.$disconnect();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
