import { Body, Controller, Post } from '@nestjs/common';
import { AccessTokenPayload } from 'src/auth/interfaces/access-token-payload';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { BookingCreationRequestDto } from './dto/requests/booking-creation-request.dto';
import { BookingService } from './booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}
  @Post()
  async create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: BookingCreationRequestDto,
  ) {
    return await this.bookingService.create(user, dto);
  }
}
