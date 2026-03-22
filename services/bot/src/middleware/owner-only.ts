import type { Context, NextFunction } from "grammy";
import { config } from "../config.js";

export async function ownerOnly(ctx: Context, next: NextFunction) {
  if (ctx.from?.id !== config.TELEGRAM_OWNER_ID) {
    return; // silently ignore non-owner messages
  }
  await next();
}
