/* eslint-disable max-classes-per-file */
import Promitter from '@nik-kita/promitter';
import { v4 } from 'uuid';
import Ws, { WebSocket } from 'ws';
import { Req } from '../api/req.api';
import { TAction } from '../types/action.type';
import { BaseMessageDto } from '../types/base-message.dto';
import { TListenerCb } from '../types/listener-cb.type';
import MarketTickerPubDto from './dto/market-ticker.pub.dto';

const PING_PONG_INTERVAL = 30_000;
type T_PROMITTER_GENERIC = {
  open: null,
  ack: null,
  message: null,
  close: null,
  welcome: null,
};

export default class KucoinWs {
    public async exitOnFalse(predicat: any, message?: any, absolutely: boolean = true) {
        if (predicat) return;
        await this.close();
        console.log(message);
        if (absolutely) process.exit(0);
    }

    public async subscribe(coins?: string[]) {
        const pub = new MarketTickerPubDto(this.id, 'subscribe', coins);
        const subscribePromise = this.promitter.wait('ack');

        this._ws.send(JSON.stringify(pub));

        await subscribePromise;

        return this;
    }

    public async unsubscribe(coins?: string[]) {
        const pub = new MarketTickerPubDto(this.id, 'unsubscribe', coins);
        const unsubscribePromise = this.promitter.wait('ack');

        this._ws.send(JSON.stringify(pub));

        await unsubscribePromise;

        return this;
    }

    addAction(action: TAction) {
        const { cb, promitterInCb } = action;
        this.promitter.on('message', cb);

        return {
            off: cb as TListenerCb,
            promitterInCb,
        };
    }

    removeActions(label: keyof T_PROMITTER_GENERIC = 'message', cbs: [TListenerCb] | undefined = undefined) {
        this.promitter.rmListeners(label, cbs);
    }

    protected _ws!: WebSocket;

    protected id!: string;

    protected stopPingPong!: typeof clearInterval;

    protected promitter!: Promitter;

    protected constructor() {
        this.promitter = new Promitter();
        this.id = v4();
    }

    public static async open() {
        const bulletRes = await Req.POST['/api/v1/bullet-private'].exec();
        const { instanceServers, token } = bulletRes!;
        const [server] = instanceServers;

        const kucoinWs = new KucoinWs();
        const waitForOpen = kucoinWs.promitter.wait('open').then(() => {
            kucoinWs.stopPingPong = clearInterval.bind(
                this,
                setInterval(
                    () => kucoinWs._ws.send(KucoinWs.generatePingPayload(kucoinWs.id)),
                    PING_PONG_INTERVAL,
                ),
            );
        });

        kucoinWs._ws = new Ws(KucoinWs.generateConnectedUrl(server.endpoint, token, kucoinWs.id))
            .on('message', (data: any) => {
                const message = JSON.parse(data) as BaseMessageDto;
                kucoinWs.promitter.emit(message.type, message);
            }).on('open', () => {
                kucoinWs.promitter.emit('open');
            }).on('close', () => {
                kucoinWs.promitter.emit('close');
            });

        await waitForOpen;

        return kucoinWs;
    }

    public close() {
        const closePromise = this.promitter.wait('close');

        this.stopPingPong();
        this._ws.close();

        return closePromise;
    }

    private static generateConnectedUrl(endpoint: string, token: string, id: string) {
        return `${endpoint}?token=${token}&[id=${id}]`;
    }

    private static generatePingPayload(id: string) {
        return `{ "id": "${id}", "type": "ping" }`;
    }
}
