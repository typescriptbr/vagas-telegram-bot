import { webhookCallback } from 'grammy';
import { serve } from 'x/sift@0.5.0/mod.ts';

import { getBot } from './bot.ts';
import { config } from './utils/config.ts';

const bot = await getBot(config);

serve({
  '/': webhookCallback(bot, 'std/http', { secretToken: config.telegramSecret }),
});
