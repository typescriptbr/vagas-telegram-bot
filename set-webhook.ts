import { Bot } from 'grammy';
import { config } from './src/utils/config.ts';

const bot = new Bot(config.telegramToken);
await bot.init();
console.log(`Setting webhook to ${Deno.args[0]} for bot ${bot.botInfo.username}`);
await bot.api.setWebhook(Deno.args[0], { secret_token: config.telegramSecret });
