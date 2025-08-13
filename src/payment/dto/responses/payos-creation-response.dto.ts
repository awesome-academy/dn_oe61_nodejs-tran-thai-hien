import { ApiProperty } from '@nestjs/swagger';

export class PayOSCreatePaymentDataDto {
  @ApiProperty({
    example: 'https://payos.com/checkout/abc123',
    description: 'URL to checkout payment',
  })
  checkoutUrl: string;

  @ApiProperty({
    example: 'https://payos.com/qrcode/abc123',
    description: 'URL of QR code',
  })
  qrCode: string;

  @ApiProperty({ example: 123456, description: 'Order code' })
  orderCode: number;

  @ApiProperty({ example: 123, description: 'Booking ID related to payment' })
  bookingId: number;

  @ApiProperty({ example: 1500000, description: 'Payment amount' })
  amount: number;

  @ApiProperty({
    example: 'Payment for booking #123',
    description: 'Payment description',
  })
  description: string;
}

export class PayOSCreatePaymentResponseDto {
  @ApiProperty({ example: '00', description: 'Response code' })
  code: string;

  @ApiProperty({
    example: 'Payment created successfully',
    description: 'Response description',
  })
  desc: string;

  @ApiProperty({
    type: () => PayOSCreatePaymentDataDto,
    description: 'Data object containing payment details',
  })
  data: PayOSCreatePaymentDataDto;
}
