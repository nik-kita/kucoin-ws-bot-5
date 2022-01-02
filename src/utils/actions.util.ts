import MarketTickerMessageDto, { TData } from '../ws/dto/market-ticker.sub.dto';

class Wrapper {
    public static calculateAgio(startPrice: number, lastPrice: number): number {
        return 100 - ((startPrice * 100) / lastPrice);
    }

    public static exploreMessage(map: Map<string, MarketTickerMessageDto>, message: MarketTickerMessageDto): Omit<MarketTickerMessageDto, 'data'> & { data: Required<TData> } {
        let coin = map.get(message.subject);
        const priceFloat = parseFloat(message.data.price);

        if (!coin) {
            coin = message;
            coin.data.lastPrice = priceFloat;
            coin.data.agio = -100;
            map.set(coin.subject, coin);
        } else {
            coin.data.agio = Wrapper.calculateAgio(coin.data.startPrice, priceFloat);
        }
        coin.data.lastPrice = priceFloat;

        return coin as Omit<MarketTickerMessageDto, 'data'> & { data: Required<TData> };
    }

    public static isActualMessage(message: MarketTickerMessageDto): boolean {
        const [coin, coinPair] = message.subject.split('-');

        return coinPair === 'USDT'
            && ![
                '3S', '3L', '5S', '5L', // TODO check this list
            ].some((bad) => coin.substring(coin.length - 2) === bad);
    }

    public static generateBoughtPrice(
        originalPrice: string,
        multiplyPercent: number,
    ): string {
        const { length: afterDotLength } = originalPrice.split('.')[1];

        return (parseFloat(originalPrice) * multiplyPercent).toFixed(afterDotLength);
    }

    public static generateBoughtSize(amountOfUsdtForDeal: number, priceToBuy: number): string {
        return String(Math.floor(amountOfUsdtForDeal / priceToBuy));
    }
}

export const {
    isActualMessage,
    generateBoughtPrice,
    generateBoughtSize,
    calculateAgio,
    exploreMessage,
} = Wrapper;
