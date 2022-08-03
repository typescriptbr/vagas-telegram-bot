import "x/dotenv@v3.2.0/load.ts";

function required(name: string) {
  const env = Deno.env.get(name);
  if (!env) throw new Error(`Environment variable ${name} is required`);
  return env;
}

export const config = {
  groupId: required("GROUP_ID"),
  channelId: required("CHANNEL_ID"),
  telegramToken: required("TELEGRAM_TOKEN"),
  telegramSecret: required("TELEGRAM_SECRET"),
  adminGroupId: required("ADMIN_GROUP_ID"),
  dbUri: required("DB_URI"),
};

export type AppConfig = typeof config;
