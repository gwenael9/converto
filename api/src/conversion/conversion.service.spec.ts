import { Test, TestingModule } from '@nestjs/testing';
import { ConversionService } from './conversion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { ConversionEntity, ConversionStatus } from './entities/conversion.entity';
import { ConversionInput } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Readable } from 'stream';
import { FileType } from './entities/conversion.entity';
import { FileUpload } from 'graphql-upload-ts';
import { of } from 'rxjs';


// MOCKING ----------------------------------------------------------------------------
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest.fn(() => {
    const stream = new (require('stream').Writable)({
      write(chunk, encoding, callback) {
        callback();
      },
    });
    process.nextTick(() => stream.emit('finish'));
    return stream;
  }),
}));

// Simulation du SDK AWS pour intercepter les appels vers S3
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn().mockImplementation((params) => ({ ...params })),
}));

describe('ConversionService', () => {
  let service: ConversionService;
  let repo: Repository<ConversionEntity>;
  let client: ClientProxy;

  // Faux repository simulant TypeORM
  const mockRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: '123', ...dto })),
    save: jest.fn().mockImplementation((dto) => Promise.resolve({ id: '123', ...dto })),
    update: jest.fn().mockResolvedValue(undefined),
  };

  // Faux client RabbitMQ simulant un envoi avec réponse
  const mockClient = {
    emit: jest.fn(), // non utilisé ici
    send: jest.fn().mockImplementation(() =>
      of('https://bucket.s3/fichier.pdf')
    ),
  };

  // Avant chaque test, on configure le module et on injecte les mocks
  beforeEach(async () => {
    jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from('fake data'));
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);

    // Valeur fictive de la variable d'environnement
    process.env.S3_BUCKET = 'fake-bucket';

    // Création du module de test avec les providers mockés
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionService,
        {
          provide: getRepositoryToken(ConversionEntity),
          useValue: mockRepo,
        },
        {
          provide: 'CONVERSION_SERVICE',
          useValue: mockClient,
        },
      ],
    }).compile();

    service = module.get<ConversionService>(ConversionService);
    repo = module.get(getRepositoryToken(ConversionEntity));
    client = module.get<ClientProxy>('CONVERSION_SERVICE');
  });

  it('should save a file and start a conversion', async () => {
    const mockFileUpload = {
      filename: 'sample.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      encoding: '7bit',
      createReadStream: jest.fn(() => Readable.from(['Hello world'])),
    } as unknown as FileUpload;

    const mockConversionInput: ConversionInput = {
      file: Promise.resolve(mockFileUpload),
      sourceType: FileType.DOCX,
      targetType: FileType.PDF,
    };

    // Espion sur la méthode d'envoi vers S3
    const sendSpy = jest.spyOn<any, any>(service['s3Client'], 'send');

    const output: ConversionOutput = await service.convertFile(mockConversionInput);
    await new Promise((res) => setImmediate(res));

    // Vérifie que le service retourne une conversion PENDING
    expect(output).toMatchObject({
      id: '123',
      status: ConversionStatus.PENDING,
    });

    // Vérifie que les différentes étapes ont bien eu lieu
    expect(mockRepo.save).toHaveBeenCalled(); // enregistrement en base
    expect(mockClient.send).toHaveBeenCalledWith(
      'convert-docx-to-pdf',
      expect.objectContaining({
        sourceS3: {
          bucket: expect.any(String),
          key: expect.any(String),
        },
        conversionId: '123',
      }),
    );
    expect(fs.createWriteStream).toHaveBeenCalled(); // écriture en local
    expect(sendSpy).toHaveBeenCalled(); // envoi vers S3
  });

  it('should throw if S3 upload fails', async () => {
    const mockFileUpload = {
        filename: 'broken.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        encoding: '7bit',
        createReadStream: jest.fn(() => Readable.from(['Corrupted content'])),
    } as unknown as FileUpload;

    const mockConversionInput: ConversionInput = {
        file: Promise.resolve(mockFileUpload),
        sourceType: FileType.DOCX,
        targetType: FileType.PDF,
    };

    jest.spyOn<any, any>(service['s3Client'], 'send')
        .mockRejectedValueOnce(new Error('S3 upload failed'));

    await expect(service.convertFile(mockConversionInput)).rejects.toThrow('S3 upload failed');
  });
});

afterEach(() => {
  delete process.env.S3_BUCKET;
});
