import { Bot, Context } from 'grammy';
import { MongoClient } from 'x/mongo@v0.31.0/mod.ts';
import { parseMode } from 'x/parse_mode@0.1.3/mod.ts';

import { approveOffer, createOffer, forwardOffer, forwardOfferAdmin, rejectOffer, start } from './handlers/handlers.ts';
import { Offers } from './repositories/offers.ts';
import type { AppConfig } from './utils/config.ts';
import { isAdmin, isGroup, isntAdmin } from './utils/predicates.ts';
import { HELP } from './utils/strings.ts';

export type AppContext = Context & {
  repositories: {
    offers: Offers;
  };
  sendToAdmins: Context['reply'];
  config: AppConfig;
};

export async function getBot(config: AppConfig) {
  console.log(`Bot config: ${JSON.stringify(config)}`);
  const bot = new Bot<AppContext>(config.telegramToken);
  bot.api.config.use(parseMode('HTML'));

  const client = new MongoClient();
  const connection = await client.connect(config.dbUri);

  // Add channel administrator list
  const groupAdmins = await bot.api
    .getChatAdministrators(config.groupId)
    .catch(() => [])
    .then((admins) => admins.map((admin) => admin.user.id))
    .then((ids) => new Set(ids));

  bot.use((ctx, next) => {
    ctx.repositories = {
      offers: new Offers(connection),
    };

    ctx.config = config;

    ctx.sendToAdmins = (text, other) => ctx.api.sendMessage(config.adminGroupId, text, other);

    next();
  });

  // Adds an administrator to the administrator list in case we add one
  bot.filter(isGroup).filter(isAdmin(groupAdmins)).on('chat_member', (ctx) => {
    groupAdmins.add(ctx.chatMember.new_chat_member.user.id);
  });

  // Removes an administrator from the administrator list in case we remove one
  bot.filter(isGroup).filter(isntAdmin(groupAdmins)).on('chat_member', (ctx) => {
    groupAdmins.delete(ctx.chatMember.new_chat_member.user.id);
  });

  bot
    .filter((ctx) => ctx.chat!.type === 'private')
    .command('help', (ctx) => ctx.reply(HELP));

  bot
    .filter(isGroup)
    .filter(isAdmin(groupAdmins))
    .command('vaga', forwardOfferAdmin);

  bot
    .filter(isGroup)
    .filter(isntAdmin(groupAdmins))
    .command('vaga', forwardOffer);

  bot.command('id', (ctx) => ctx.reply(`chat: ${ctx.chat.id}, from: ${ctx.message?.from.id}`));
  bot.hears(/#tsbrvagas/, createOffer);
  bot.callbackQuery(/approve-(.*)/, approveOffer);
  bot.callbackQuery(/reject-(.*)/, rejectOffer);
  bot.command('start', start);

  return bot;
}
