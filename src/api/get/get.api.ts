/* eslint-disable max-classes-per-file */
import { GET } from '../constants.api';
import { GetAccountsReq } from './account-info.get.api';
import { GetOrderInfoReq } from './order-info.post.api';
import { GetTradeFeesReq } from './trade-fees.get.api';

const { API_V1_ACCOUNTS, API_V1_ORDER, API_V1_TRADE_FEES } = GET;
const apiOrderInfoById = API_V1_ORDER.endpoint;

export default class GetReq {
    public static [API_V1_ACCOUNTS] = new GetAccountsReq();

    public static [apiOrderInfoById] = {
        orderId(orderId: string) {
            return new GetOrderInfoReq(orderId);
        },
    };

    public static [API_V1_TRADE_FEES] = new GetTradeFeesReq();
}
