import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'configuration';
import {
  AcceptLanguageResolver,
  I18nJsonLoader,
  I18nModule,
} from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { I18nValidationPipe } from './common/pipes/i18n-validation.pipe';
import { CoreModule } from './core/core.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthGuard } from './common/guards/auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { TransformDataInterceptor } from './common/interceptors/transform-data.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `../.env`,
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<string>('database.url', 'localdb'),
      inject: [ConfigService],
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(process.cwd(), 'src/locales'),
        watch: true,
      },
      loader: I18nJsonLoader,
      resolvers: [
        {
          use: AcceptLanguageResolver,
          options: ['x-custom-lang'],
        },
      ],
    }),
    UserModule,
    AuthModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_PIPE',
      useClass: I18nValidationPipe,
    },
    {
      provide: 'APP_FILTER',
      useClass: GlobalExceptionFilter,
    },
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: 'APP_GUARD',
      useClass: RoleGuard,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: TransformDataInterceptor,
    },
  ],
})
export class AppModule {}
