import { Module } from '@nestjs/common';
import { ConversionResolver } from './conversion.resolver';
import { ConversionService } from './conversion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionEntity } from './entities/conversion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConversionEntity])],
  providers: [ConversionResolver, ConversionService],
})
export class ConversionModule {}
