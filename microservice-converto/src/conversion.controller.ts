import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversionService } from './conversion.service';

@Controller()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @MessagePattern('convert-docx-to-pdf')
    async handleConversionRequest(@Payload() data: any): Promise<string> {
      const result = await this.conversionService.convertAndUpload(data);
      console.log('Conversion result:', result);
      return result;
    }
}
