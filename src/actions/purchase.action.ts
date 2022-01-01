import Promitter from '@nik-kita/promitter';
import prompts from 'prompts';
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
  }): TAction {
        const {
            minPercent,
            multiplyPercentToBuy,
            usdtAmount,
        } = options;
        let isOrderingStarted = false;
        const promitter = new Promitter()
            .on('repeatOrder', () => {
                isOrderingStarted = false;
            })
            .on('stopOrder', () => {
                isOrderingStarted = true;
            });
        const coinsMap = new Map<string, MarketTickerMessageDto>();

        return {
            cb: (message: MarketTickerMessageDto) => {
                if (!isActualMessage(message) || isOrderingStarted) return;

                let coin = coinsMap.get(message.subject);
                const priceFloat = parseFloat(message.data.price);

                if (!coin) {
                    coin = message;
                    coin.data.startPrice = priceFloat;
                    coin.data.agio = 0;

                    coinsMap.set(message.subject, coin);
                } else {
                    coin.data.agio = calculateAgio(coin.data.startPrice, priceFloat);
                }

                coin.data.lastPrice = priceFloat;

                if (coin.data.agio <= minPercent) return;

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
                                res,
                                symbol: coin!.subject,
                            });
                        } else promitter.emit('failPurchase', res);
                    });
            },
            promitterInCb: promitter,
        };
    }

    public static purchaseCli() {
        return prompts([
            {
                type: 'number',
                message: 'Min percent when to make purchase: ',
                name: 'minPercent',
                initial: 1,
            },
            {
                type: 'number',
                message: 'Amount of USDT you ready to spend: ',
                name: 'usdtAmount',
                initial: 5,
            },
            {
                type: 'number',
                message: 'multiplyPercentToBuyToBuy: ',
                name: 'multiplyPercentToBuy',
                initial: 1.1,
            },
        ]);
    }
}

export const {
    PurchaseAction,
    purchaseCli,
} = Wrapper;
