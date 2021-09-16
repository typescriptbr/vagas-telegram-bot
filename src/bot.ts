import axios, { AxiosInstance } from 'axios'
import { CallbackQuery, Message, Opts, Telegram, ApiResponse } from 'typegram'
import { AppConfig } from './config'
import { Offers } from './offers'
import {
  APPROVE_BUTTON,
  CHANNEL_POST,
  CHANNEL_POST_URL,
  GROUP_POST,
  HELP,
  NEW_OFFER,
  OFFER_APPROVED,
  OFFER_APPROVED_ADMIN,
  OFFER_CREATED,
  OFFER_REJECTED,
  OFFER_REJECTED_ADMIN,
  REJECT_BUTTON
} from './strings'

const SEND_HELP_METHOD = (chatId: number) => ({
  method: 'sendMessage',
  chat_id: chatId,
  text: HELP,
  parse_mode: 'HTML'
})

const ANSWER_CALLBACK_QUERY_METHOD = (
  callbackQueryId: string,
  text?: string
): Opts<'answerCallbackQuery'> & { method: 'answerCallbackQuery' } => ({
  method: 'answerCallbackQuery',
  callback_query_id: callbackQueryId,
  text,
  show_alert: true
})

const isMessageFromPrivateChat = (message: Message): boolean => message.chat.type === 'private'

export class Bot {
  readonly #api: AxiosInstance
  readonly #offers: Offers
  readonly #config: AppConfig

  constructor(token: string, offers: Offers, config: AppConfig) {
    this.#api = axios.create({
      baseURL: `https://api.telegram.org/bot${token}/`
    })
    this.#offers = offers
    this.#config = config
  }

  async #post<M extends keyof Telegram, T extends ReturnType<Telegram[M]>>(
    method: M,
    params: Opts<M>
  ): Promise<T> {
    return this.#api
      .post<ApiResponse<T>>(method, params)
      .then(({ data }) => data)
      .then((result) => {
        if (result.ok) return result.result
        throw new Error(result.description)
      })
  }

  async #messageAdmins(message: string, options: Partial<Opts<'sendMessage'>> = {}): Promise<any> {
    return this.#post('sendMessage', {
      chat_id: this.#config.adminGroupId,
      text: message,
      ...options,
      reply_markup: options.reply_markup ? (JSON.stringify(options.reply_markup) as any) : undefined
    })
  }

  async #postToChannel(message: string) {
    return this.#post('sendMessage', {
      chat_id: this.#config.channelId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  }

  async #createOffer(message: Message.TextMessage) {
    if (!message.from?.id) return

    const offer = await this.#offers.create(
      message.from.id,
      message.from.first_name,
      message.text.replace(/#tsbrvagas/gi, '')
    )

    await this.#post('sendMessage', {
      chat_id: message.chat.id,
      text: OFFER_CREATED(offer._id.toHexString())
    })

    await this.#messageAdmins(NEW_OFFER(offer), {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: APPROVE_BUTTON, callback_data: `approve-${offer._id.toHexString()}` }],
          [{ text: REJECT_BUTTON, callback_data: `reject-${offer._id.toHexString()}` }]
        ]
      }
    })
  }

  async #handlePrivateMessage(message: Message.TextMessage) {
    if (!message.text.includes('#tsbrvagas')) {
      return SEND_HELP_METHOD(message.chat.id)
    }

    return this.#createOffer(message)
  }

  async handleCallbackQuery(callbackQuery: CallbackQuery.DataCallbackQuery): Promise<any> {
    const {
      data,
      id: queryId,
      from: { id: userId, first_name: firstName },
      message: { message_id: originalMessageId, chat: { id: originalChatId } } = { chat: {} }
    } = callbackQuery

    if (!data.startsWith('approve-') && !data.startsWith('reject-'))
      return ANSWER_CALLBACK_QUERY_METHOD(queryId, 'data não contém o formato correto')

    const [action, offerId] = data.split('-')

    const offer = await this.#offers.findById(offerId)

    if (!offer || offer.status !== 'pending')
      return ANSWER_CALLBACK_QUERY_METHOD(queryId, 'vaga inválida ou já revisada')

    if (action === 'approve') {
      const channelMessage = await this.#postToChannel(CHANNEL_POST(offer))
      await this.#offers.approve(offerId, userId)

      const postUrl = CHANNEL_POST_URL(
        this.#config.channelId.replace('@', ''),
        channelMessage.message_id
      )

      await this.#messageAdmins(OFFER_APPROVED_ADMIN(offerId, userId, firstName), {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })

      await this.#post('sendMessage', {
        chat_id: offer.authorId,
        text: OFFER_APPROVED(offer._id.toHexString(), userId, firstName, postUrl),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })

      await this.#post('sendMessage', {
        chat_id: this.#config.groupId,
        text: GROUP_POST(postUrl),
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })

      await this.#post('editMessageReplyMarkup', {
        chat_id: originalChatId,
        message_id: originalMessageId,
        reply_markup: { inline_keyboard: [] }
      })

      return ANSWER_CALLBACK_QUERY_METHOD(queryId, 'Vaga aprovada ✔️')
    }

    if (action === 'reject') {
      await this.#post('sendMessage', {
        chat_id: offer.authorId,
        text: OFFER_REJECTED(offer._id.toHexString(), userId, firstName),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })

      await this.#offers.reject(offerId, userId)

      await this.#messageAdmins(OFFER_REJECTED_ADMIN(offerId, userId, firstName), {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })

      await this.#post('editMessageReplyMarkup', {
        chat_id: originalChatId,
        message_id: originalMessageId,
        reply_markup: { inline_keyboard: [] }
      })

      return ANSWER_CALLBACK_QUERY_METHOD(queryId, 'Vaga rejeitada ❌')
    }

    return ANSWER_CALLBACK_QUERY_METHOD(queryId)
  }

  async handleMessage(message: Message.TextMessage): Promise<any> {
    if (!message.from?.id) return

    if (!isMessageFromPrivateChat(message)) {
      return {
        method: 'sendMessage',
        text: 'Para publicar uma vaga, converse comigo no privado :)',
        chat_id: message.chat.id,
        reply_to_message_id: message.message_id
      }
    }

    if (isMessageFromPrivateChat(message)) return this.#handlePrivateMessage(message)

    return {
      method: 'sendMessage',
      chat_id: message.chat.id,
      text: 'Desculpe. Não entendi :/'
    }
  }
}
