import { CommandMiddleware } from 'grammy';
import { AppContext } from '../bot.ts';
import { HELP, OFFER_STATUS } from '../utils/strings.ts';

export const start: CommandMiddleware<AppContext> = async (ctx) => {
  await ctx.replyWithChatAction('typing');
  if (!ctx.match) {
    return ctx.reply(HELP);
  }

  const offerId = ctx.match;
  const offer = await ctx.repositories.offers.findById(offerId);

  if (!offer || offer.authorId !== ctx.from?.id) {
    return ctx.reply(HELP);
  }

  return ctx.reply(OFFER_STATUS(offer));
};
