import Promitter from '@nik-kita/promitter';
import { Req } from '../api/req.api';
import { TAction } from '../types/action.type';
import {
    calculateAgio, generateBoughtPrice, generateBoughtSize, isActualMessage,
} from '../utils/actions.util';
import MarketTickerMessageDto from '../ws/dto/market-ticker.sub.dto';

class Wrapper {
    public static PurchaseAction(options: {
    minPercent: number | string,
    multiplyPercentToBuy: number | string,
    usdtAmount: number | string,
  }): TAction {
        let {
            minPercent,
            multiplyPercentToBuy,
            usdtAmount,
        } = options;
        minPercent = parseFloat(minPercent as string);
        multiplyPercentToBuy = parseFloat(multiplyPercentToBuy as string);
        usdtAmount = parseFloat(usdtAmount as string);

        let isOrderingStarted = false;
        const coinsMap = new Map<string, MarketTickerMessageDto & { ttl?: any }>();
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
                    coin.ttl = setTimeout(() => {
                        coinsMap.delete(message.subject);
                    }, 300);

                    coinsMap.set(message.subject, coin);
                } else {
                    clearTimeout(coin.ttl!);
                    coin.ttl = setTimeout(() => {
                        coinsMap.delete(message.subject);
                    }, 300);
                    coin.data.agio = calculateAgio(coin.data.startPrice, priceFloat);
                }

                coin.data.lastPrice = priceFloat;

                promitter.emit('log', coin);
                if (coin.data.agio <= minPercent) return;

                isOrderingStarted = true;

                const boughtPrice = generateBoughtPrice(coin.data.price, multiplyPercentToBuy as number);
                const boughtSize = generateBoughtSize(usdtAmount as number, parseFloat(boughtPrice));

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
