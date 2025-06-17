import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('convert-docx-to-pdf')
  async handleConversionRequest(@Payload() data: any): Promise<string> {
    const { sourceS3, conversionId } = data;

    try {
      const result = await this.appService.convertAndUploadFromS3(
        sourceS3.bucket,
        sourceS3.key,
        conversionId,
      );

      return result.url;
    } catch (error) {
      console.error('Error in microservice:', error);
      throw error;
    }
  }
}
