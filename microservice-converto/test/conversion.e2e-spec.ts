import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

describe('Conversion Integration Tests', () => {
  let app: INestApplication;
  let appService: AppService;
  let s3Client: S3Client;

  const testBucket = process.env.S3_BUCKET || 'test-bucket';
  const testConversionId = 'test-conversion-' + Date.now();
  const testDocxPath = path.join(__dirname, '../test-files/test.docx');

  beforeAll(async () => {
    // Créer le dossier test-files s'il n'existe pas
    if (!fs.existsSync(path.join(__dirname, '../test-files'))) {
      fs.mkdirSync(path.join(__dirname, '../test-files'), { recursive: true });
    }

    // Créer un fichier DOCX de test simple
    const testContent = 'Test content';
    fs.writeFileSync(testDocxPath, testContent);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    console.log('access', process.env.S3_ACCESS_KEY);

    appService = app.get<AppService>(AppService);
    s3Client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    // Nettoyage des fichiers de test
    if (fs.existsSync(testDocxPath)) {
      fs.unlinkSync(testDocxPath);
    }
  });

  it('should convert DOCX to PDF and return signed URL', async () => {
    // 1. Upload du fichier DOCX dans S3
    const docxContent = fs.readFileSync(testDocxPath);
    const uploadCommand = new PutObjectCommand({
      Bucket: testBucket,
      Key: `uploads/${testConversionId}.docx`,
      Body: docxContent,
      ContentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    await s3Client.send(uploadCommand);

    // 2. Appel du service de conversion
    const result = await appService.convertAndUploadFromS3(
      testBucket,
      `uploads/${testConversionId}.docx`,
      testConversionId,
    );

    // 3. Vérifications
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('.pdf');
    expect(result.url).toContain(testConversionId);

    // 4. Vérifier que le fichier PDF existe dans S3
    const getObjectCommand = new GetObjectCommand({
      Bucket: testBucket,
      Key: `converted-files/${testConversionId}.pdf`,
    });

    try {
      await s3Client.send(getObjectCommand);
    } catch (error) {
      fail("Le fichier PDF n'a pas été trouvé dans S3");
    }
  });
});
