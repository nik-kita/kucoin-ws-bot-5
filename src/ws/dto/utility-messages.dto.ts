/* eslint-disable max-classes-per-file */
import { BaseMessageDto } from '../../types/base-message.dto';

/* eslint-disable max-classes-per-file */
export type TMessage = 'message' | 'ack' | 'welcome' | 'error';

export class WelcomeMessageDto extends BaseMessageDto {
    id!: string;

    type!: 'welcome';
}

export class AckMessageDto extends BaseMessageDto {
    id!: string;

    type!: 'ack';
}
