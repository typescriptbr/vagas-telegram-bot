import { safeHtml, stripIndent } from 'https://cdn.esm.sh/v86/common-tags@1.8.0/deno/common-tags.js?dts';
import type { Offer } from '../repositories/offers.ts';
import { config } from './config.ts';

export const OFFER_CREATED = (id: string) =>
  `Vaga #${id} criada! Te aviso por aqui quando ela for aprovada e postada no canal :)`;

export const OFFER_APPROVED = (
  id: string,
  approvedById: number,
  approvedByName: string,
) =>
  stripIndent(safeHtml)`
  Boas notícias! A vaga #${id} foi aprovada por <a href="tg://user?id=${approvedById}">${approvedByName}</a>.

  Para acessar a postagem no canal de vagas, é só clicar no botão aqui em baixo.
`;

export const OFFER_REJECTED = (
  offer: Offer,
  rejectedById: number,
  rejectedByName: string,
) =>
  stripIndent(safeHtml)`
  Oi ${offer.authorName}. Passando pra te avisar que a vaga #${offer._id.toHexString()} foi rejeitada por <a href="tg://user?id=${rejectedById}">${rejectedByName}</a>.

  Se quiser, você pode chamar a pessoa que rejeitou a vaga no privado pra entender melhor o que aconteceu.

  Obrigado por divulgar vagas aqui :)
`;

export const OFFER_APPROVED_ADMIN = (
  id: string,
  approvedById: number,
  approvedByName: string,
) =>
  stripIndent(safeHtml)`
  <a href="tg://user?id=${approvedById}">${approvedByName}</a> aprovou a vaga #${id}!
`;

export const OFFER_REJECTED_ADMIN = (
  id: string,
  rejectedById: number,
  rejectedByName: string,
) =>
  stripIndent(safeHtml)`
  <a href="tg://user?id=${rejectedById}">${rejectedByName}</a> rejeitou a vaga #${id}!
`;

export const NEW_OFFER = (offer: Offer) =>
  stripIndent(safeHtml)`
  <b>Nova vaga de trabalho para aprovação</b>
  <b>Postada por:</b> <a href="tg://user?id=${offer.authorId}">${offer.authorName}</a>.

  <b>Texto da vaga:</b>
  <i>${offer.text}</i>

  Admins, favor revisar a vaga e utilizar um dos botões para aprová-la ou recusá-la.

  #${offer._id.toHexString()}
`;

export const APPROVE_BUTTON = 'Aprovar ✅';
export const REJECT_BUTTON = 'Rejeitar ❌';

export const HELP = stripIndent`
  Olá! Para publicar uma vaga, me envie o texto da vaga <b>contendo a tag #tsbrvagas</b>.

  Assim que me enviar a vaga, vou encaminha-la para as pessoas admins do grupo aprovarem.

  Uma vez aprovada, a vaga será postada no canal :)
`;

export const CHANNEL_POST = (offer: Offer) =>
  stripIndent(safeHtml)`
  <b>Nova vaga postada por <a href="tg://user?id=${offer.authorId}">${offer.authorName}</a>!</b>

  <b>Descrição</b>

  ${offer.text.trim()}

  ----------------------------------------------------

  #${offer._id.toHexString()}
`;

export const CHANNEL_POST_URL = (channelId: string, messageId: number) =>
  safeHtml`https://t.me/${channelId}/${messageId}`;

export const GROUP_POST = (postUrl: string) => safeHtml`Tem [vaga nova](${postUrl}) no @typescriptbr_vagas, galera! :D`;

export const FORWARDED_OFFER = (offer: Offer) =>
  stripIndent(safeHtml)`
    Oi, <a href="tg://user?id=${offer.authorId}">${offer.authorName}</a>. Vi que você postou uma vaga, mas temos um <a href="${config.offerRulesUrl}">fluxo específico</a> pra isso aqui no canal.

    Essa que você postou já foi enviada pra aprovação, mas das próximas vezes me envia ela no privado, seguindo o fluxo certinho, por favor :)

    Se quiser acompanhar o status da aprovação, clica no botão aqui em baixo.
  `;

export const FORWARDED_OFFER_ADMIN = (offer: Offer, channelUrl: string) =>
  stripIndent`
    Oi, <a href="tg://user?id=${offer.authorId}">${offer.authorName}</a>. Vi que você postou uma vaga, mas temos um <a href="${config.offerRulesUrl}">fluxo específico</a> pra isso aqui no canal.

    Essa que você postou já foi postada lá <a href="${channelUrl}">no canal</a>, mas das próximas vezes me envia ela no privado, seguindo o fluxo certinho, por favor :)
`;

export const STATUS = (status: Offer['status']) =>
  status === 'pending' ? 'Aguardando aprovação' : status === 'approved' ? 'Aprovada' : 'Rejeitada';

export const OFFER_STATUS = ({ _id, status }: Offer) =>
  stripIndent`
    Opa, tudo bem?

    A vaga foi registrada com o id #${_id.toHexString()} e o status atual dela é <b>"${STATUS(status)}</b>".

    Assim que tiver alguma novidade, te aviso por aqui :)
  `;
