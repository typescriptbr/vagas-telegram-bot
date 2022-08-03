import { config as loadConfig } from 'deno/dotenv/mod.ts';

const envs = await loadConfig({ safe: true });

export const config = {
  groupId: envs['GROUP_ID'],
  channelId: envs['CHANNEL_ID'],
  telegramToken: envs['TELEGRAM_TOKEN'],
  telegramSecret: envs['TELEGRAM_SECRET'],
  adminGroupId: envs['ADMIN_GROUP_ID'],
  dbUri: envs['DB_URI'],
  offerRulesUrl: envs['OFFER_RULES_URL'],
};

export type AppConfig = typeof config;
