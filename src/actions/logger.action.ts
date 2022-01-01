import Promitter from '@nik-kita/promitter';
import prompts from 'prompts';
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

    public static loggerCli() {
        return prompts([
            {
                type: 'number',
                message: 'No more than 1 log every _ mms? (1 log every _ miliseconds) or (negative for any logs) or (0 for display each log)',
                name: 'logInterval',
                initial: -1,
            },
        ]);
    }
}

export const {
    LoggerAction,
    loggerCli,
} = LoggerActionClass;
