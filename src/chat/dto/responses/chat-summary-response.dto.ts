import { ApiProperty } from '@nestjs/swagger';

export class ChatSummaryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the chat message',
    example: 101,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the sender user',
    example: 1,
  })
  senderId: number;

  @ApiProperty({
    description: 'Name of the sender user',
    example: 'Alice',
  })
  senderName: string;

  @ApiProperty({
    description: 'ID of the receiver user',
    example: 2,
  })
  receiverId: number;

  @ApiProperty({
    description: 'Name of the receiver user',
    example: 'Bob',
  })
  receiverName: string;

  @ApiProperty({
    description: 'Content of the chat message',
    example: 'Hello, how are you?',
  })
  content: string;

  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: '2025-08-09T10:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  sentAt: Date;
}
