import { AppContext } from '../bot.ts';

export const isAdmin = (admins: Set<number>) => (ctx: AppContext) =>
  admins.has(ctx.message?.from?.id || 0) ||
  ['administrator', 'owner'].includes(ctx.chatMember?.new_chat_member?.status || '');

export const isntAdmin = (admins: Set<number>) => (ctx: AppContext) => !(isAdmin(admins))(ctx);
export const isGroup = (ctx: AppContext) => ctx.chat?.type === 'group' || ctx.chat?.type === 'supergroup';
export const isPrivate = (ctx: AppContext) => ctx.chat?.type === 'private';
