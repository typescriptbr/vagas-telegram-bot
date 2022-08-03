import { CommandMiddleware } from 'grammy';
import { AppContext } from '../bot.ts';
import { CHANNEL_POST, CHANNEL_POST_URL, FORWARDED_OFFER_ADMIN } from '../utils/strings.ts';

export const forwardOfferAdmin: CommandMiddleware<AppContext> = async (ctx) => {
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

  await ctx.repositories.offers.approve(offer._id.toHexString(), ctx.from.id);

  const channelMessage = await ctx.api.sendMessage(ctx.config.channelId, CHANNEL_POST(offer));

  await Promise.all([
    ctx.reply(FORWARDED_OFFER_ADMIN(offer, CHANNEL_POST_URL(ctx.config.channelId, channelMessage.message_id)), {
      disable_web_page_preview: true,
    }),
    ctx.deleteMessage(),
    ctx.api.deleteMessage(originalMessage.chat.id, originalMessage.message_id),
  ]);
};
