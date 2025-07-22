import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { SignupDto } from './dto/requests/signup.dto';
import { LoginDto } from './dto/requests/login.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('/signup')
  async signup(@Body() dto: SignupDto) {
    return await this.userService.signup(dto);
  }
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.userService.login(dto);
  }
}
