import prompts from 'prompts';
import fs from 'fs';
import { join } from 'path';

const filePath = join(__dirname, '..', 'cli.json');

export async function cli() {
    const input = await prompts([
        {
            type: 'number',
            float: true,
            message: (() => {
                const sms = 'ON WHICH % OF COIN`S PRICE GROWING DEAL PURCHASE?';
                return sms.padEnd(50 - sms.length);
            })(),
            name: 'minPercent',
            initial: 1,
        },
        {
            type: 'number',
            float: true,
            message: (() => {
                const sms = 'HOW MANY USDT$ YOU READY TO LOOSE?';
                return sms.padEnd(50 - sms.length);
            })(),
            name: 'usdtAmount',
            initial: 5,
        },
        {
            type: 'number',
            float: true,
            message: (() => {
                const sms = 'HOW MANY MULTIPLY PRICE FOR PURCHASE?';
                return sms.padEnd(50 - sms.length);
            })(),
            name: 'multiplyPercentToBuy',
            initial: 1.1,
        },
        {
            name: 'ttl',
            float: true,
            type: 'number',
            message: (() => {
                const sms = 'TTL FOR COIN STORING';
                return sms.padEnd(50 - sms.length);
            })(),
            initial: 1000,
        },
        {
            name: 'resetDbTimer',
            float: true,
            type: 'number',
            message: (() => {
                const sms = 'HOW OFTEN RESET DB?';
                return sms.padEnd(50 - sms.length);
            })(),
            initial: 4000,
        },
        {
            type: 'number',
            float: true,
            message: (() => {
                const sms = 'HOW OFTEN DISPLAY LOGS?';
                return sms.padEnd(50 - sms.length);
            })(),
            name: 'logInterval',
            initial: 0,
        },
    ]);

    fs.writeFileSync(filePath, JSON.stringify(input), { encoding: 'utf-8' });

    return input;
}
export async function previousCli() {
    return fs.existsSync(filePath)
        ? JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))
        : cli();
}
