import { serve } from "@hono/node-server";
import { app } from "./app";

const port = Number(process.env.TRUEGUARD_API_PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TrueGuard API listening on http://localhost:${info.port}`);
});
