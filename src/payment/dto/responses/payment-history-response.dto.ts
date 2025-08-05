export class PaymentHistoryResponseDto {
  id: number;
  amount: number;
  method: string;
  status: string;
  paidAt: Date | null;
  booking: {
    id: number;
    startTime: Date;
    endTime: Date;
  };
  user: {
    id: number;
    name: string;
  };
  createdAt: Date;
}
