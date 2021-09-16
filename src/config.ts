import env from 'sugar-env'

export const config = {
  groupId: env.get('GROUP_ID', ''),
  channelId: env.get('CHANNEL_ID', ''),
  telegramToken: env.get('TELEGRAM_TOKEN', ''),
  adminGroupId: env.get('ADMIN_GROUP_ID', ''),
  dbUri: env.get('DB_URI', 'mongodb://localhost:27017')
}

export type AppConfig = typeof config
