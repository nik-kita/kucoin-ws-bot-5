import COINS_LIST from './api/get/coins';
import { Req } from './api/req.api';

(async () => {
    const res = await Req
        .GET['/api/v1/accounts']
        .setParams({
            type: 'trade',
        }).exec();

    if (!res) return;

    console.log(res?.length);

    const { coins, subjects } = res.filter((i) => !['USDT'].includes(i.currency))
        .reduce((acc, value) => {
            if (parseFloat(value.available) <= 0) return acc;

            if (
                !COINS_LIST.data.find((e) => e.name === `${value.currency}-USDT`)
            ) return acc;

            acc.subjects.push(`${value.currency}-USDT`);
            acc.coins.push({
                currency: value.currency,
                available: value.available,
            });

            return acc;
        }, {
            subjects: [] as string[],
            coins: [] as any[],
        });

    console.log(coins, coins.length);
})();
