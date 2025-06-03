import { Module } from '@nestjs/common';
import { ConversionResolver } from './conversion.resolver';
import { ConversionService } from './conversion.service';

@Module({
  providers: [ConversionResolver, ConversionService],
})
export class ConversionModule {}
