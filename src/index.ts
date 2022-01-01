import { PurchaseAction, purchaseCli } from './actions/purchase.action';
import KucoinWs from './ws/kucoin.ws';

(async () => {
    const ku = await KucoinWs.open();
    await ku.subscribe();

    const cli = await purchaseCli();

    const { off, promitterInCb } = ku.addAction(PurchaseAction(cli));

    promitterInCb.on('failPurchase', (data) => {
        console.log('FAIL:', data);
        promitterInCb.emit('repeatOrder');
    });

    const p = await promitterInCb.wait('purchase');

    console.log(p);

    ku.removeActions('message', [off]);
    await ku.close();
})();
