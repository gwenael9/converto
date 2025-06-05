import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule.forRoot({
    //   envFilePath: '../.env',
    //   isGlobal: true,
    // }),
  ],
  controllers: [AppController, ConversionController],
  providers: [ConversionService],
})
export class AppModule {}
