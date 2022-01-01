import { v4 } from 'uuid';
import { BaseMethod } from '../../base-method.api';
import { POST } from '../../constants.api';
import { TMarketOrderBody, TOrderRes } from './orders.type.api';

const { API_V1_ORDERS } = POST;

export class PostOrderMarketReq extends BaseMethod<TOrderRes, any, TMarketOrderBody> {
    constructor() {
        super('POST', API_V1_ORDERS);
    }

    public setBody(body: TMarketOrderBody) {
        super.setBody(body);

        return this;
    }
}

export const MARKET = (
    side: 'buy' | 'sell',
) => ({
    symbol(symbol: string) {
        return {
            size(sizeOrFunds: string) {
                return new PostOrderMarketReq().setBody({
                    clientOid: v4(),
                    side,
                    type: 'market',
                    symbol,
                    size: sizeOrFunds,
                }) as Pick<PostOrderMarketReq, 'exec'>;
            },
            funds(sizeOrFunds: string) {
                return new PostOrderMarketReq().setBody({
                    clientOid: v4(),
                    side,
                    type: 'market',
                    symbol,
                    funds: sizeOrFunds,
                }) as Pick<PostOrderMarketReq, 'exec'>;
            },
        };
    },
});
