import { ConversionService } from './conversion.service';
export declare class AppController {
    private readonly conversionService;
    constructor(conversionService: ConversionService);
    testConvert(fileName: string): Promise<string>;
}
