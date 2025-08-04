export class PayOSCreatePaymentResponseDto {
  code: string;
  desc: string;
  data: {
    checkoutUrl: string;
    qrCode: string;
    orderCode: number;
    bookingId: number;
    amount: number;
    description: string;
  };
}
