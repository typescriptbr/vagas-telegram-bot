import { HearsMiddleware, InlineKeyboard } from 'grammy'
import { AppContext } from '../bot.ts'
import { APPROVE_BUTTON, NEW_OFFER, OFFER_CREATED, REJECT_BUTTON } from '../strings.ts'

export const createOffer: HearsMiddleware<AppContext> = async (ctx) => {
  await ctx.replyWithChatAction('typing')
  if (!ctx.from || !ctx.msg.text) return
  const { id, first_name } = ctx.from

  const offer = await ctx.repositories.offers.create(
    id,
    first_name,
    ctx.msg.text.replace('#tsbrvagas', '').trim()
  )

  await ctx.reply(OFFER_CREATED(offer._id.toHexString()))

  const inlineKeyboard = new InlineKeyboard()
    .text(APPROVE_BUTTON, `approve-${offer._id.toHexString()}`)
    .row()
    .text(REJECT_BUTTON, `reject-${offer._id.toHexString()}`)

  await ctx.sendToAdmins(NEW_OFFER(offer), {
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard
  })
}
