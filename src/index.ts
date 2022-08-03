import { config } from "./config.ts";
import { getBot } from "./bot.ts";

const bot = await getBot(config);

bot.start({
  onStart: (info) =>
    console.log(`${info.username} Bot started on long poling mode.`),
});
