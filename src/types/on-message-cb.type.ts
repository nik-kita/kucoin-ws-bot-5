import { BaseMessageDto } from './base-message.dto';

export type OnMessageCb<T extends BaseMessageDto = BaseMessageDto> = (message: T) => void;
