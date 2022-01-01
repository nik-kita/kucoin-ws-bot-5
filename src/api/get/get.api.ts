/* eslint-disable max-classes-per-file */
import { GET } from '../constants.api';
import { GetAccountsReq } from './account-info.get.api';
import { GetOrderInfoReq } from './order-info.post.api';

const { API_V1_ACCOUNTS, API_V1_ORDER } = GET;
const methodName = API_V1_ORDER.endpoint;

export default class GetReq {
    public static [API_V1_ACCOUNTS] = new GetAccountsReq();

    public static [methodName] = {
        orderId(orderId: string) {
            return new GetOrderInfoReq(orderId);
        },
    };
}
