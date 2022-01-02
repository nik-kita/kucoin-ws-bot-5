/* eslint-disable arrow-body-style */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import prompts from 'prompts';
import { LoggerAction } from './actions/logger.action';
import { PurchaseAction } from './actions/purchase.action';
import { TOrderRes } from './api/post/orders/orders.type.api';
import { Req } from './api/req.api';
import { previousCli, cli } from './cli';
import MarketTickerMessageDto from './ws/dto/market-ticker.sub.dto';
import KucoinWs from './ws/kucoin.ws';

(async () => {
    const ku = await KucoinWs.open();
    await ku.subscribe();
    const input = (await prompts({
        message: 'LOAD PREVIOUS CONFIGURATIONS?',
        type: 'confirm',
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
    const order = await promitterInCb.wait<{ res: TOrderRes, coin: MarketTickerMessageDto, log: string }>('purchase');
    const orderInfoPromise = Req.GET['/api/v1/orders/:orderId'].orderId(order.res.orderId).exec();
    loggerPromitter.emit('clearInterval');
    loggerPromitter.rmListeners();
    ku.removeActions('message', [off]);
    clearInterval(stopCleaningDb);
    await ku.unsubscribe();
    await ku.subscribe([order.coin.subject]);
    const { off: loggerOff2 } = await ku.addAction(LoggerAction({
        logInterval: 0,
    }));
    const orderInfo = await orderInfoPromise;
    console.log(order.coin);
    console.log(orderInfo);
    console.log(order.log);
    const sellOrder = await Req
        .POST['/api/v1/orders']
        .sell
        .limit
        .symbol(order.coin.subject)
        .price((() => {
            return orderInfo!.price;
        })())
        .size(orderInfo!.dealSize)
        .exec();
    ku.removeActions('message', [loggerOff2]);
    console.log('============================');
    if (sellOrder) {
        const sellInfo = await Req.GET['/api/v1/orders/:orderId'].orderId(sellOrder.orderId).exec();
        console.log(sellInfo);
    }
    await ku.close();
})();
