import "dotenv/config";
import { readFileSync } from "node:fs";
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
    // TiDB Cloud public endpoints require TLS. The MariaDB driver validates
    // the Let's Encrypt certificate against Node's system CA store.
    ssl: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 3)
  });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

const typeDefs = readFileSync(fileURLToPath(new URL("./schema/schema.graphql", import.meta.url)), "utf8");

export const yoga = createYoga({
  graphqlEndpoint: process.env.VERCEL ? "/api/graphql" : "/graphql",
  schema: createSchema({ typeDefs, resolvers }),
  context: () => ({ prisma: getPrisma() }),
  graphiql: process.env.NODE_ENV !== "production",
  disposeOnProcessTerminate: true
});

export async function disconnectPrisma() {
  await prisma?.$disconnect();
}
