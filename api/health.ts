import type { IncomingMessage, ServerResponse } from "node:http";

export default function health(_request: IncomingMessage, response: ServerResponse) {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ status: "ok" }));
}
