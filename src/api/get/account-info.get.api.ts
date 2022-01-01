/* eslint-disable max-classes-per-file */
import { BaseMethod } from '../base-method.api';
import { GET } from '../constants.api';

const { API_V1_ACCOUNTS } = GET;

export type AccountInfoResDto = [{
  id: string,
  currency: string,
  type: 'main' | 'trade' | 'margin' | 'pool',
  balance: string,
  available: string,
  holds: string,
}]

export class AccountInfoParamsDto {
    type?: 'main' | 'trade' | 'margin';

    currency?: string;
}

export class GetAccountsReq extends BaseMethod<AccountInfoResDto, AccountInfoParamsDto> {
    constructor(
        params?: object,
    ) {
        super(
            'GET',
            API_V1_ACCOUNTS,
            params,
        );
    }

    public setParams(params: AccountInfoParamsDto) {
        super.setParams(params);

        return this;
    }
}
