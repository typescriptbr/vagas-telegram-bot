import { Bot } from "x/grammy@v1.10.1/mod.ts";
import type { AppConfig } from "./config.ts";

export function getBot(config: AppConfig) {
  const bot = new Bot(config.telegramToken);

  bot.command("start", (ctx) => ctx.reply("Hello!"));

  return bot;
}
