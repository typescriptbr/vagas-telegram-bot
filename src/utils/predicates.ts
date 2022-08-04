import { AppContext } from '../bot.ts';

export const isAdmin = (ctx: AppContext) =>
  ctx.admins.has(ctx.message?.from?.id || 0) ||
  ['administrator', 'creator'].includes(ctx.chatMember?.new_chat_member?.status || '');

export const isntAdmin = (ctx: AppContext) => !(isAdmin(ctx));
export const isGroup = (ctx: AppContext) => ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
export const isPrivate = (ctx: AppContext) => ctx.chat?.type === 'private';
