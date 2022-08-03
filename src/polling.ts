import { getBot } from './bot.ts';
import { config } from './utils/config.ts';

const bot = await getBot(config);

bot.start({
  onStart: (info) => console.log(`${info.username} Bot started on long poling mode.`),
});
