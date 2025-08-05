import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MailModule } from 'src/mail/mail.module';
import { UserViewController } from './user-view.controller';

@Module({
  imports: [AuthModule, MailModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UserController, UserViewController],
})
export class UserModule {}
