export const HOST = 'https://api.kucoin.com' as const;

export const GET = {
    API_V1_ACCOUNTS: '/api/v1/accounts' as const,
    API_V1_ORDER: {
        endpoint: '/api/v1/orders/:orderId' as const,
        generateLink: (orderId: string) => `/api/v1/orders/${orderId}`,
    },
};

export const POST = {
    API_V1_ORDERS: '/api/v1/orders' as const,
    API_V1_BULLET_PRIVATE: '/api/v1/bullet-private' as const,
};
