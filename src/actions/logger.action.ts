import Promitter from '@nik-kita/promitter';
import { TAction } from '../types/action.type';
import { OnMessageCb } from '../types/on-message-cb.type';
import MarketTickerMessageDto from '../ws/dto/market-ticker.sub.dto';

const promitter = new Promitter();

class LoggerActionClass {
    public static LoggerAction(options: {
    logInterval: number,
    strategy?: OnMessageCb<MarketTickerMessageDto>,
  }): TAction {
        const { strategy, logInterval } = options;
        let isFirst = !(logInterval < 0);
        let currentMessage: string = '';
        let dbSize = 0;
        promitter.on('dbLen', (data: number) => {
            dbSize = data;
        });
        const logTimer = (interval: number) => {
            const offInterval = setInterval(() => {
                console.log(currentMessage);
            }, interval);
            promitter.on('clearInterval', () => clearInterval(offInterval));
        };

        return {
            cb: strategy || ((message: MarketTickerMessageDto) => {
                const a = `${message.subject}: ${message.data.price}`;
                const b = `${message.data.agio} %`.padStart(50 - a.length);
                const c = String(dbSize).padStart(70 - a.length - b.length);
                currentMessage = a + b + c;

                if (!isFirst) return;

                if (logInterval === 0) {
                    console.log(currentMessage);
                    return;
                }

                isFirst = false;
                logTimer(logInterval < 500 ? 500 : logInterval);
            }),
            promitterInCb: promitter,
        };
    }
}

export const {
    LoggerAction,
} = LoggerActionClass;
