import Promitter from '@nik-kita/promitter';
import { TAction } from '../types/action.type';

const promitter = new Promitter<'clearInterval'>();

class LoggerActionClass {
    public static LoggerAction(options: {
    logInterval: number,
  }): TAction {
        const { logInterval } = options;
        let isFirst = !(logInterval < 0);
        let currentMessage: object = {};
        const logTimer = (interval: number) => {
            const offInterval = setInterval(() => {
                console.log(currentMessage);
            }, interval);
            promitter.on('clearInterval', () => clearInterval(offInterval));
        };

        return {
            cb(message) {
                currentMessage = message;

                if (!isFirst) return;

                if (logInterval === 0) {
                    console.log(currentMessage);
                    return;
                }

                isFirst = false;
                logTimer(logInterval < 500 ? 500 : logInterval);
            },
            promitterInCb: promitter,
        };
    }
}

export const {
    LoggerAction,
} = LoggerActionClass;
