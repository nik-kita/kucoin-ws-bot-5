import Promitter from '@nik-kita/promitter';
import { OnMessageCb } from './on-message-cb.type';

export type TAction = {
  cb: OnMessageCb<any>,
  promitterInCb: Promitter,
}
