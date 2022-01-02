import Promitter from '@nik-kita/promitter';
import { Req } from '../api/req.api';
import { TAction } from '../types/action.type';
import {
    calculateAgio, generateBoughtPrice, generateBoughtSize, isActualMessage,
} from '../utils/actions.util';
import MarketTickerMessageDto from '../ws/dto/market-ticker.sub.dto';

class Wrapper {
    public static PurchaseAction(options: {
    minPercent: number,
    multiplyPercentToBuy: number,
    usdtAmount: number,
    ttl?: number,
    counter: number,
  }): TAction {
        const {
            minPercent = 1,
            multiplyPercentToBuy = 1.1,
            usdtAmount = 5,
            ttl,
            counter = 2,
        } = options;

        let isOrderingStarted = false;
        const coinsMap = new Map<string, MarketTickerMessageDto & { ttl?: any, counter?: number }>();
        const promitter = new Promitter()
            .on('repeatOrder', () => {
                // TODO
            })
            .on('stopOrder', () => {
                isOrderingStarted = true;
            })
            .on('cleanDb', () => {
                coinsMap.clear();
            });

        return {
            cb: (message: MarketTickerMessageDto) => {
                if (!isActualMessage(message) || isOrderingStarted) return;
                promitter.emit('dbLen', coinsMap.size);

                let coin = coinsMap.get(message.subject);
                const priceFloat = parseFloat(message.data.price);

                if (!coin) {
                    coin = message;
                    coin.data.startPrice = priceFloat;
                    coin.data.agio = 0;
                    coin.counter = 0;
                    coin.ttl = ttl && setTimeout(() => {
                        coinsMap.delete(message.subject);
                    }, ttl);

                    coinsMap.set(message.subject, coin);
                } else {
                    // eslint-disable-next-line no-unused-expressions
                    ttl && clearTimeout(coin.ttl!);
                    coin.ttl = setTimeout(() => {
                        coinsMap.delete(message.subject);
                    }, ttl);
                    coin.data.agio = calculateAgio(coin.data.startPrice, priceFloat);
                }

                if (coin.data.lastPrice !== priceFloat)++coin.counter!;
                coin.data.lastPrice = priceFloat;

                promitter.emit('log', coin);
                if (coin.counter! < counter || coin.data.agio <= minPercent) return;

                isOrderingStarted = true;

                const boughtPrice = generateBoughtPrice(coin.data.price, multiplyPercentToBuy);
                const boughtSize = generateBoughtSize(usdtAmount, parseFloat(boughtPrice));

                Req
                    .POST['/api/v1/orders']
                    .buy
                    .limit
                    .symbol(coin.subject)
                    .price(boughtPrice)
                    .size(boughtSize)
                    .exec()
                    .then((res) => {
                        if (res) {
                            promitter.emit('purchase', {
                                size: boughtSize,
                                price: boughtPrice,
                                res,
                                coin,
                                log: `\n\n\n${`${coin!.subject.split('-')[0]}`.padStart(50)}\n\n\n`,
                            });
                        } else promitter.emit('failPurchase', res);
                    });
            },
            promitterInCb: promitter,
        };
    }
}

export const {
    PurchaseAction,
} = Wrapper;
