import { ConversionService } from './conversion.service';
export declare class ConversionController {
    private readonly conversionService;
    constructor(conversionService: ConversionService);
    handleConversionRequest(data: any): Promise<string>;
}
