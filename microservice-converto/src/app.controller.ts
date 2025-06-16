import { Controller, Get, Query } from '@nestjs/common';
import { ConversionService } from './conversion.service';

@Controller()
export class AppController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('test-convert')
  async testConvert(
    @Query('bucket') bucket: string,
    @Query('key') key: string,
    @Query('conversionId') conversionId: string,
  ): Promise<{ url: string }> {
    return await this.conversionService.convertAndUploadFromS3(
      bucket,
      key,
      conversionId,
    );
  }
}
