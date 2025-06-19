import { Test, TestingModule } from '@nestjs/testing';
import { ConversionResolver } from './conversion.resolver';
import { ConversionService } from './conversion.service';
import { ConversionInput } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';
import { FileType } from './entities/conversion.entity';
import { FileUpload } from 'graphql-upload-ts';


describe('ConversionResolver', () => {
  let resolver: ConversionResolver;
  let service: ConversionService;

    // MOCKING ----------------------------------------------------------------------------
    const mockFileUpload = {
        filename: 'sample.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: '7bit',
        createReadStream: jest.fn(),
        fieldName: 'file',
        capacitor: undefined,
    } as FileUpload;

    const mockConversionInput: ConversionInput = {
        file: Promise.resolve(mockFileUpload),
        sourceType: FileType.DOCX,
        targetType: FileType.PDF,
    };

  const mockConversionOutput: ConversionOutput = {
    id: 'mon-fichier-123',
    status: 'PENDING',
    convertedFileUrl: null,
    error: null,
  };

  const mockService = {
    convertFile: jest.fn(),
    getConversionStatus: jest.fn(),
  };
  // FIN DU MOCKING ------------------------------------------------------------------------

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionResolver,
        {
          provide: ConversionService,
          useValue: mockService,
        },
      ],
    }).compile();

    resolver = module.get<ConversionResolver>(ConversionResolver);
    service = module.get<ConversionService>(ConversionService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should call convertFile and return result', async () => {
    mockService.convertFile.mockResolvedValue(mockConversionOutput);

    const result = await resolver.convertFile(mockConversionInput);

    expect(service.convertFile).toHaveBeenCalledWith(mockConversionInput);
    expect(result).toEqual(mockConversionOutput);
  });

  it('should handle errors from convertFile', async () => {
    const errorMessage = 'Conversion failed';
    mockService.convertFile.mockRejectedValue(new Error(errorMessage));

    await expect(resolver.convertFile(mockConversionInput)).rejects.toThrow(errorMessage);
    expect(service.convertFile).toHaveBeenCalledWith(mockConversionInput);
  });

  it('should return conversion status for a given ID', async () => {
    const conversionId = 'mon-fichier-123';
    mockService.getConversionStatus = jest.fn().mockResolvedValue(mockConversionOutput);

    const result = await resolver.getConversionStatus(conversionId);

    expect(service.getConversionStatus).toHaveBeenCalledWith(conversionId);
    expect(result).toEqual(mockConversionOutput);
  });

  it("should throw an error if service isn't available", async () => {
    const conversionId = 'mon-fichier-123';
    const errorMessage = 'Conversion not found';
    mockService.getConversionStatus = jest.fn().mockRejectedValue(new Error(errorMessage));

    await expect(resolver.getConversionStatus(conversionId)).rejects.toThrow(errorMessage);
    expect(service.getConversionStatus).toHaveBeenCalledWith(conversionId);
  });
});