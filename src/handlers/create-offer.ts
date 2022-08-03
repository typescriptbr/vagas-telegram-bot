import { HearsMiddleware } from 'grammy';
import { AppContext } from '../bot.ts';
import { requestApproval } from '../utils/request-approval.ts';
import { OFFER_CREATED } from '../utils/strings.ts';

export const createOffer: HearsMiddleware<AppContext> = async (ctx) => {
  await ctx.replyWithChatAction('typing');
  if (!ctx.from || !ctx.msg.text) return;
  const { id, first_name } = ctx.from;

  const offer = await ctx.repositories.offers.create(
    id,
    first_name,
    ctx.msg.text.replace('#tsbrvagas', '').trim(),
  );

  await ctx.reply(OFFER_CREATED(offer._id.toHexString()));

  return requestApproval(ctx, offer);
};
