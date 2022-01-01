export class BaseMessageDto {
    id!: string;

    type!: 'message' | 'ack' | 'welcome';
}
