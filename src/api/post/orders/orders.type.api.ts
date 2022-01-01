export type TOrderRes = {
  orderId: string,
}

export type TBaseOrderBody = {
  clientOid: string,

  side: 'buy' | 'sell',

  symbol: string,
};

// requires one of 'size' or 'funds' properties
export type TMarketOrderBody = TBaseOrderBody & {
  type: 'market',

  size?: string,

  funds?: string,
};

export type TLimitOrderBodyDto = TBaseOrderBody & {
  size: string,

  price: string,

  type: 'limit',
};
