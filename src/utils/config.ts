const required = (env: string) => {
  const value = Deno.env.get(env);

  if (!value) throw new Error(`missing requried environment variable ${env}`);

  return value;
};

export const config = {
  groupId: required('GROUP_ID'),
  channelId: required('CHANNEL_ID'),
  telegramToken: required('TELEGRAM_TOKEN'),
  telegramSecret: required('TELEGRAM_SECRET'),
  adminGroupId: required('ADMIN_GROUP_ID'),
  dbUri: required('DB_URI'),
  offerRulesUrl: required('OFFER_RULES_URL'),
};

export type AppConfig = typeof config;
