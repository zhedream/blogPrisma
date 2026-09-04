import { createServer } from "node:http";
import { disconnectPrisma, yoga } from "./app.js";

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
  await disconnectPrisma();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
