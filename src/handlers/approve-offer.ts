import { CallbackQueryMiddleware } from 'grammy'
import { AppContext } from '../bot.ts'
import { CHANNEL_POST, CHANNEL_POST_URL, OFFER_APPROVED, OFFER_APPROVED_ADMIN } from '../strings.ts'

export const approveOffer: CallbackQueryMiddleware<AppContext> = async (ctx) => {
  if (!ctx.match) return
  await ctx.replyWithChatAction('typing')

  const offerId = ctx.match[1]
  const offer = await ctx.repositories.offers.findById(offerId)

  if (!offer) return
  if (offer.status !== 'pending')
    return ctx.answerCallbackQuery(`Status atual da vaga inválido (${offer.status})`)

  await ctx.repositories.offers.approve(offerId, ctx.from!.id)
  await ctx.api.editMessageReplyMarkup(
    ctx.callbackQuery.message!.chat.id,
    ctx.callbackQuery.message!.message_id,
    { reply_markup: { inline_keyboard: [] } }
  )

  await ctx.sendToAdmins(
    OFFER_APPROVED_ADMIN(offer._id.toHexString(), ctx.from!.id, ctx.from.first_name)
  )

  const channelMessage = await ctx.api.sendMessage(ctx.config.channelId, CHANNEL_POST(offer))

  await ctx.api.sendMessage(
    offer.authorId,
    OFFER_APPROVED(
      offer._id.toHexString(),
      ctx.from!.id,
      ctx.from.first_name,
      CHANNEL_POST_URL(ctx.config.channelId, channelMessage.message_id)
    )
  )
}
