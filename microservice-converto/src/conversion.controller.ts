import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConversionService } from './conversion.service';

@Controller()
export class ConversionController {
  constructor(private readonly conversionService: ConversionService) {}

  @MessagePattern('convert-docx-to-pdf')
  async handleConversionRequest(@Payload() data: any): Promise<string> {
    console.log('Received message:', data);

    const { sourceS3, conversionId } = data;

    const result = await this.conversionService.convertAndUploadFromS3(
      sourceS3.bucket,
      sourceS3.key,
      conversionId
    );

    console.log('Conversion result:', result);

    return result;
  }
}
