import type { MiddlewareHandler } from "hono";
import { config } from "../config.js";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = header.slice(7);
  if (token !== config.FORGE_API_KEY) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  await next();
};
