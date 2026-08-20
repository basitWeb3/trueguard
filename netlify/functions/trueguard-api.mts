import type { Config, Context } from "@netlify/functions";
import { app } from "../../api/app";

export default (request: Request, _context: Context) => app.fetch(request);

export const config: Config = {
  path: ["/health", "/v1/*", "/openapi.json"],
};
