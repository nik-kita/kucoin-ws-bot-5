import { LoggerAction } from './actions/logger.action';
import { pause } from './utils/pause.util';
import KucoinWs from './ws/kucoin.ws';

(async () => {
    const ku = await KucoinWs.open();
    await ku.subscribe();

    const { off, promitterInCb } = ku.addAction(LoggerAction({
        logInterval: 500,
    }));

    await pause(4000);

    promitterInCb.emit('clearInterval');

    ku.removeActions('message', [off]);
})();
