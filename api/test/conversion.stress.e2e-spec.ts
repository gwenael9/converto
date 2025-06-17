import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import * as request from 'supertest';
import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

describe('Stress test de conversion', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const sendConversionRequest = (filePath: string) => {
    const mutation = `
      mutation($file: Upload!) {
        convertFile(input: {
          file: $file
          sourceType: DOCX
          targetType: PDF
        }) {
          id
          status
          convertedFileUrl
        }
      }
    `;

    return request(app.getHttpServer())
      .post('/graphql')
      .field(
        'operations',
        JSON.stringify({
          query: mutation,
          variables: { file: null },
        }),
      )
      .field('map', JSON.stringify({ '0': ['variables.file'] }))
      .attach('0', fs.createReadStream(filePath));
  };

  async function runInBatches(batchSize: number, tasks: (() => Promise<any>)[]) {
    const results = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(task => task()));
      results.push(...batchResults);
    }

    return results;
  }

  it('doit lancer 20 conversions et vérifier leur enregistrement', async () => {
    const filePath = path.join(__dirname, 'test-files', 'TEST.docx');
    console.log('Lancement de 20 requêtes (par lots de 5)...');

    const tasks = Array.from({ length: 20 }).map(() => () => sendConversionRequest(filePath));
    const results = await runInBatches(5, tasks);

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        const response = res.value;
        expect(response.status).toBe(200);
        expect(response.body.data?.convertFile).toBeDefined();
        expect(response.body.data.convertFile.status).toBe('PENDING');
        expect(response.body.data.convertFile.convertedFileUrl).toBeNull();

        console.log(`Requête ${index + 1} — ID: ${response.body.data.convertFile.id}`);
      } else {
        console.error(`Requête ${index + 1} échouée :`, res.reason?.message || res.reason);
      }
    });
  }, 120_000);
});
