import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagePayloadDto } from './dto/requests/message-payload.dto';
import { ChatEvent } from './enums/chat-event.enum';

@Injectable()
export class ChatPublisher {
  constructor(private readonly eventEmitter: EventEmitter2) {}
  publishCreateMessage(payload: MessagePayloadDto): void {
    console.log('Create publish');
    this.eventEmitter.emit(ChatEvent.CREATE_MESSAGE, payload);
  }
}
