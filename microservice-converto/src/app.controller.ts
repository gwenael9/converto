import { Controller, Get, Query } from '@nestjs/common';
import { ConversionService } from './conversion.service';

@Controller()
export class AppController {
  constructor(private readonly conversionService: ConversionService) {}

  @Get('test-convert')
  async testConvert(@Query('path') localPath: string): Promise<string> {
    const result = await this.conversionService.convertAndUpload({ localPath });
    return result;
  }
}
