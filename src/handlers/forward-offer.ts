import { CommandMiddleware, InlineKeyboard } from 'grammy';
import { AppContext } from '../bot.ts';
import { requestApproval } from '../utils/request-approval.ts';
import { FORWARDED_OFFER } from '../utils/strings.ts';
const noop = () => {};

export const forwardOffer: CommandMiddleware<AppContext> = async (ctx) => {
  if (!ctx.message) return;
  if (!ctx.message.reply_to_message) {
    return ctx.reply('Não entendi. Responda à mensagem que deseja encaminhar');
  }

  await ctx.replyWithChatAction('typing');

  const originalMessage = ctx.message.reply_to_message;
  const originalMessageAuthor = originalMessage.from!;

  if (!originalMessage.text) {
    return ctx.reply(
      'Essa mensagem parece não ter nenhum texto. Fale com um admin.',
      { reply_to_message_id: ctx.message.message_id },
    );
  }

  const offer = await ctx.repositories.offers.create(
    originalMessageAuthor.id,
    originalMessageAuthor.first_name,
    originalMessage.text,
  );

  const keyboard = new InlineKeyboard().url(
    'Acompanhar status',
    `https://t.me/${ctx.me.username}?start=${offer._id.toHexString()}`,
  );

  await requestApproval(ctx, offer);
  await ctx.reply(FORWARDED_OFFER(offer), { reply_markup: keyboard, disable_web_page_preview: true });

  await Promise.all([
    ctx.deleteMessage().catch(noop),
    ctx.api.deleteMessage(originalMessage.chat.id, originalMessage.message_id).catch(noop),
  ]);
};
