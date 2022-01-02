import prompts from 'prompts';
import { Req } from '../api/req.api';

(async () => {
    const { coin } = await prompts({
        type: 'text',
        name: 'coin',
        message: 'WHAT COIN SELL ON MARKET?',
    });
    const info = await Req.GET['/api/v1/accounts'].setParams({ currency: coin, type: 'trade' }).exec();
    await Req.POST['/api/v1/orders'].sell.market.symbol(`${coin}-USDT`).size(info![0].available);
})();
