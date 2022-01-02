/* eslint-disable arrow-body-style */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import prompts from 'prompts';
import { LoggerAction } from './actions/logger.action';
import { PurchaseAction } from './actions/purchase.action';
import { TOrderRes } from './api/post/orders/orders.type.api';
import { Req } from './api/req.api';
import { cli, previousCli } from './cli';
import MarketTickerMessageDto from './ws/dto/market-ticker.sub.dto';
import KucoinWs from './ws/kucoin.ws';

(async () => {
    while (true) {
        const ku = await KucoinWs.open();
        await ku.subscribe();

        const input = (await prompts({
            message: 'LOAD PREVIOUS CONFIGURATIONS?',
            type: 'confirm',
            initial: 'y',
            name: 'loadPrev',
        })).loadPrev
            ? await previousCli()
            : await cli();
        const { off, promitterInCb } = ku.addAction(PurchaseAction(input));
        const { cb: logCb, promitterInCb: loggerPromitter } = LoggerAction(input);
        promitterInCb.on('failPurchase', (data) => {
            console.log('FAIL:', data);
            promitterInCb.emit('repeatOrder');
        }).on('dbLen', (size: number) => {
            loggerPromitter.emit('dbLen', size);
        }).on('log', (coin: MarketTickerMessageDto) => {
            logCb(coin);
        });
        const stopCleaningDb = setInterval(() => {
            promitterInCb.emit('cleanDb');
        }, input.resetDbTimer);
        const order = await promitterInCb.wait<{ size: string, price: string, res: TOrderRes, coin: MarketTickerMessageDto, log: string }>('purchase');
        clearInterval(stopCleaningDb);
        promitterInCb.rmListeners();
        // const orderInfoPromise = Req.GET['/api/v1/orders/:orderId'].orderId(order.res.orderId).exec();
        loggerPromitter.emit('clearInterval');
        loggerPromitter.rmListeners();
        ku.removeActions('message', [off]);
        // const _price = (() => {
        //     const p = (parseFloat(order.coin.data.price) * 1.04).toFixed(3);
        //     console.log('============================', order.coin.data.price, order.price);
        //     console.log('PRICE:', p);
        //     console.log('============================');
        //     return p;
        // })();
        const _size = (() => {
            const s = order.size;
            console.log('============================');
            console.log('SIZE:', s);
            console.log('============================');

            return s;
        })();
        // const res = await Req.POST['/api/v1/orders']
        //     .sell
        //     .limit
        //     .symbol(order.coin.subject)
        //     .price(_price)
        //     .size(_size)
        //     .exec();
        // console.log(res);
        // console.log(order.log);

        // if (!(await prompts({
        //     message: 'AGAIN?',
        //     type: 'confirm',
        //     initial: 'y',
        //     name: 'again',
        // })).again) break;

        try {
            Req.POST['/api/v1/orders'].sell.market.symbol(order.coin.subject).size(_size);
        } catch (e) {
            console.log('ERROR');
        }

        await ku.removeActions();
        await ku.close();
    }
})();
