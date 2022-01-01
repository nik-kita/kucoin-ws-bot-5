/* eslint-disable max-classes-per-file */
import { POST } from '../constants.api';
import { PostBulletPrivateReq } from './bullet.post.api';
import { LIMIT } from './orders/limit-order.post.api';
import { MARKET } from './orders/market-order.post.api';

const { API_V1_BULLET_PRIVATE, API_V1_ORDERS } = POST;

export default class PostReq {
    public static [API_V1_ORDERS] = {
        buy: {
            limit: LIMIT('buy'),
            market: {
                size: MARKET('buy'),
                funds: MARKET('buy'),
            },
        },
        sell: {
            limit: LIMIT('sell'),
            market: MARKET('sell'),
        },
    };

    public static [API_V1_BULLET_PRIVATE] = new PostBulletPrivateReq();
}
