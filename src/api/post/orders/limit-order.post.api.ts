import { v4 } from 'uuid';
import { BaseMethod } from '../../base-method.api';
import { POST } from '../../constants.api';
import { TLimitOrderBodyDto, TOrderRes } from './orders.type.api';

const { API_V1_ORDERS } = POST;

export class PostOrderLimitReq extends BaseMethod<TOrderRes, any, TLimitOrderBodyDto> {
    constructor() {
        super('POST', API_V1_ORDERS);
    }

    public setBody(body: TLimitOrderBodyDto) {
        super.setBody(body);

        return this;
    }
}

export const LIMIT = (side: 'buy' | 'sell') => ({
    symbol(symbol: string) {
        return {
            price(price: string) {
                return {
                    size(size: string) {
                        return new PostOrderLimitReq().setBody({
                            clientOid: v4(),
                            side,
                            symbol,
                            type: 'limit',
                            price,
                            size,
                        }) as Pick<PostOrderLimitReq, 'exec'>;
                    },
                };
            },
        };
    },
});
