import { WebSocket } from 'ws';
import { BaseMessageDto } from '../../types/base-message.dto';

export type TData = {
  bestAsk: string,
  bestAskSize: string,
  bestBid: string,
  betsBidSize: string,
  price: string,
  lastPrice: number,
  startPrice: number,
  sequence: string,
  size: string,
  time: number,
  lastTime: number,
  startTime: number,
  agio?: number,
}

export default class MarketTickerMessageDto extends BaseMessageDto {
    target!: WebSocket;

    type!: 'message';

    topic!: string;

    subject!: string;

    data!: TData;
}
