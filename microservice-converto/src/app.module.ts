import { Module } from '@nestjs/common';
import { ConversionService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ConversionController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [ConversionController],
  providers: [ConversionService],
})
export class AppModule {}
