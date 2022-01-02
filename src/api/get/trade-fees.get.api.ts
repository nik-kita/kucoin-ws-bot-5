/* eslint-disable max-classes-per-file */
import { BaseMethod } from '../base-method.api';
import { GET } from '../constants.api';

const { API_V1_TRADE_FEES } = GET;

export type TFee = {
    symbol: string,
    takerFeeRate: string,
    makerFeeRate: string,
}

export class TradeFeesResDto {
    code!: string;

    data!: TFee[];
}

export class TradeFeesParamsDto {
    symbols!: string[];
}

export class GetTradeFeesReq extends BaseMethod<TradeFeesResDto, TradeFeesParamsDto> {
    constructor() {
        super(
            'GET',
            API_V1_TRADE_FEES,
        );
    }

    public setParams(params: TradeFeesParamsDto) {
        super.setParams(params);

        return this;
    }
}
