import { InlineKeyboard } from 'grammy';
import { AppContext } from '../bot.ts';
import { Offer } from '../repositories/offers.ts';
import { APPROVE_BUTTON, NEW_OFFER, REJECT_BUTTON } from './strings.ts';

export const requestApproval = async (ctx: AppContext, offer: Offer) => {
  const inlineKeyboard = new InlineKeyboard()
    .text(APPROVE_BUTTON, `approve-${offer._id.toHexString()}`)
    .row()
    .text(REJECT_BUTTON, `reject-${offer._id.toHexString()}`);

  return ctx.sendToAdmins(NEW_OFFER(offer), {
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  });
};
