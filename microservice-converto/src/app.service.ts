import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const execAsync = promisify(exec);

@Injectable()
export class AppService {
  private s3Client: S3Client;
  private s3PublicClient: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });

    this.s3PublicClient = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_PUBLIC_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });
  }

  async convertAndUploadFromS3(
    bucket: string,
    key: string,
    conversionId: string,
  ): Promise<{ url: string }> {
    console.log(
      `Starting conversion for s3://${bucket}/${key}, conversionId=${conversionId}`,
    );

    const localDocxPath = `/tmp/${conversionId}.docx`;

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.s3Client.send(getCommand);

    const writeStream = fs.createWriteStream(localDocxPath);
    const bodyStream = response.Body as any;

    await new Promise<void>((resolve, reject) => {
      bodyStream.pipe(writeStream);
      bodyStream.on('error', reject);
      writeStream.on('finish', () => resolve());
    });

    // Convertion en .pdf
    const outputPdfPath = `/tmp/${conversionId}.pdf`;

    const command = `soffice --headless --convert-to pdf "${localDocxPath}" --outdir "/tmp"`;

    const { stdout, stderr } = await execAsync(command);

    if (stderr) console.error('LibreOffice error:', stderr);

    if (!fs.existsSync(outputPdfPath)) {
      throw new Error(`Output PDF not found: ${outputPdfPath}`);
    }

    const convertedKey = `converted-files/${conversionId}.pdf`;

    const fileContent = fs.readFileSync(outputPdfPath);

    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: convertedKey,
      Body: fileContent,
      ContentType: 'application/pdf',
    });

    await this.s3Client.send(uploadCommand);

    // Génération de la pre-signed URL avec le client public
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: convertedKey,
    });

    const signedUrl = await getSignedUrl(
      this.s3PublicClient,
      getObjectCommand,
      {
        expiresIn: 600,
      },
    );

    // Nettoyage des fichiers locaux
    fs.unlinkSync(localDocxPath);
    fs.unlinkSync(outputPdfPath);

    // On return directement l'URL pré-signée
    return {
      url: signedUrl,
    };
  }
}
