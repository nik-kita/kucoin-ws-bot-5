import { BaseMethod } from '../base-method.api';
import { POST } from '../constants.api';

const { API_V1_BULLET_PRIVATE } = POST;

type TBulletPrivateRes = {
  token: string,
  instanceServers: [
      {
          endpoint: string,
          encrypt: number,
          protocol: string,
          pingInterval: number,
          pingTimeout: number,
      }
  ]
}

export class PostBulletPrivateReq extends BaseMethod<TBulletPrivateRes> {
    constructor() {
        super('POST', API_V1_BULLET_PRIVATE);
    }
}
