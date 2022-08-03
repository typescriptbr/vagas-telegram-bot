import { CommandMiddleware } from "grammy";
import { AppContext } from "../bot.ts";

export const forwardOffer: CommandMiddleware<AppContext> = async (ctx) => {
  if (!ctx.message) return;
  if (!ctx.message.reply_to_message)
    return ctx.reply("Não entendi. Responda à mensagem que deseja encaminhar");

  const originalMessage = ctx.message.reply_to_message;
  const originalMessageAuthor = originalMessage.from!;

  if (!originalMessage.text)
    return ctx.reply(
      "Essa mensagem parece não ter nenhum texto. Fale com um admin.",
      { reply_to_message_id: ctx.message.message_id }
    );

  const offer = await ctx.repositories.offers.create(
    originalMessageAuthor?.id,
    originalMessageAuthor?.first_name,
    originalMessage.text
  );

  await Promise.all([
    ctx.reply()
    ctx.deleteMessage(),
    ctx.api.deleteMessage(originalMessage.chat.id, originalMessage.message_id),
  ]);
};
