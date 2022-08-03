import { MongoClient } from 'x/mongo@v0.31.0/mod.ts'
import { parseMode } from 'x/parse_mode@0.1.3/mod.ts'
import { Bot, Context } from 'grammy'

import type { AppConfig } from './config.ts'
import { Offers } from './offers.ts'
import { createOffer } from './handlers/create-offer.ts'
import { approveOffer } from './handlers/approve-offer.ts'
import { rejectOffer } from './handlers/reject-offer.ts'
import { HELP } from './strings.ts'

export type AppContext = Context & {
  repositories: {
    offers: Offers
  }
  sendToAdmins: Context['reply']
  config: AppConfig
}

export async function getBot(config: AppConfig) {
  const bot = new Bot<AppContext>(config.telegramToken)
  bot.api.config.use(parseMode('HTML'))

  const client = new MongoClient()
  const connection = await client.connect(config.dbUri)

  bot.use((ctx, next) => {
    ctx.repositories = {
      offers: new Offers(connection)
    }

    ctx.config = config

    ctx.sendToAdmins = (text, other) => {
      return ctx.api.sendMessage(config.adminGroupId, text, other)
    }

    next()
  })

  bot.filter((ctx) => ctx.chat!.type === 'private').command('help', (ctx) => ctx.reply(HELP))
  bot.hears(/#tsbrvagas/, createOffer)
  bot.callbackQuery(/approve-(.*)/, approveOffer)
  bot.callbackQuery(/reject-(.*)/, rejectOffer)

  return bot
}
