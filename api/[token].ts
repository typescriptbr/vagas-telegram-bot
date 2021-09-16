import { VercelRequest, VercelResponse } from '@vercel/node'
import { Db, MongoClient } from 'mongodb'
import type { CallbackQuery, Message, Update } from 'typegram'
import { Bot } from '../src/bot'
import { config } from '../src/config'
import { Offers } from '../src/offers'

type ValidUpdate = Update.CallbackQueryUpdate | Update.MessageUpdate

type TextMessageUpdate = Update.MessageUpdate & { message: Message.TextMessage }

const isCallbackQuery = (
  update: any
): update is Update.CallbackQueryUpdate & { callback_query: CallbackQuery.DataCallbackQuery } => {
  return update.callback_query !== undefined && update.callback_query.data !== undefined
}

const isMessage = (update: any): update is TextMessageUpdate => {
  return !!update.message && !!update.message.text
}

const isValidUpdate = (update: any) => isCallbackQuery(update) || isMessage(update)

const createConnection = () =>
  MongoClient.connect(config.dbUri).then((connection) => connection.db('tsbr-vagas'))

let db: Db

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  const update: ValidUpdate = req.body

  if (req.query.token !== config.telegramToken) {
    console.error(`Received invalid token ${req.query.token}`)
    return res.status(403).json({ message: `invalid token ${req.query.token}` })
  }

  if (!isValidUpdate(update)) {
    console.error(`Received invalid update: ${JSON.stringify(update, null, 4)}`)
    return res.status(200).json({ message: 'invalid update', update })
  }

  db = db || (await createConnection())

  const offers = new Offers(db)
  const bot = new Bot(config.telegramToken, offers, config)

  let result: any

  if (isCallbackQuery(update)) {
    result = await bot.handleCallbackQuery(update.callback_query)
  }

  if (isMessage(update)) {
    result = await bot.handleMessage(update.message)
  }

  if (result) return res.status(200).json(result)

  return res.status(204).end()
}

export default function (req: VercelRequest, res: VercelResponse) {
  try {
    handleRequest(req, res)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'internal server error' })
  }
}
