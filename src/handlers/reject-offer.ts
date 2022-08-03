import { CallbackQueryMiddleware } from 'grammy';
import { AppContext } from '../bot.ts';
import { OFFER_REJECTED, OFFER_REJECTED_ADMIN } from '../utils/strings.ts';

export const rejectOffer: CallbackQueryMiddleware<AppContext> = async (ctx) => {
  if (!ctx.match) return;

  const offerId = ctx.match[1];
  const offer = await ctx.repositories.offers.findById(offerId);

  if (!offer) return;
  if (offer.status !== 'pending') {
    return ctx.answerCallbackQuery(`Status atual da vaga inválido (${offer.status})`);
  }

  await ctx.repositories.offers.reject(offerId, ctx.from!.id);

  await Promise.all([
    ctx.api.editMessageReplyMarkup(
      ctx.callbackQuery.message!.chat.id,
      ctx.callbackQuery.message!.message_id,
      { reply_markup: { inline_keyboard: [] } },
    ),
    ctx.sendToAdmins(
      OFFER_REJECTED_ADMIN(offer._id.toHexString(), ctx.from!.id, ctx.from.first_name),
    ),
    ctx.api.sendMessage(
      offer.authorId,
      OFFER_REJECTED(offer, ctx.from!.id, ctx.from.first_name),
    ).catch(() => {}),
  ]);
};
