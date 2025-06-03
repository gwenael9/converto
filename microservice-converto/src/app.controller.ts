import { Controller, Get, Query } from '@nestjs/common';
import { ConversionService } from './conversion.service';

@Controller()
export class AppController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('test-convert')
  async testConvert(@Query('file') fileName: string): Promise<string> {
    const result = await this.conversionService.convertAndUpload({ fileName });
    return result;
  }
}
