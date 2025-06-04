import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';

@Module({
  imports: [],
  controllers: [AppController, ConversionController],
  providers: [ConversionService],
})
export class AppModule {}
