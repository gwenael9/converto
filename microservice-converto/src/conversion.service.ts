import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const execAsync = promisify(exec);

@Injectable()
export class ConversionService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://minio:9000',
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });
  }

  async convertAndUploadFromS3(bucket: string, key: string, conversionId: string): Promise<string> {
    console.log(`Starting conversion for s3://${bucket}/${key}, conversionId=${conversionId}`);

    const localDocxPath = `/tmp/${conversionId}.docx`;

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await this.s3Client.send(getCommand);

    const writeStream = fs.createWriteStream(localDocxPath);
    const bodyStream = response.Body as any;

    await new Promise<void>((resolve, reject) => {
      (bodyStream as any).pipe(writeStream);
      bodyStream.on('error', reject);
      writeStream.on('finish', () => resolve());
    });

    console.log(`File downloaded to: ${localDocxPath}`);

    // Convertion en .pdf
    const outputPdfPath = `/tmp/${conversionId}.pdf`;

    const command = `soffice --headless --convert-to pdf "${localDocxPath}" --outdir "/tmp"`;

    console.log('Running command:', command);

    const { stdout, stderr } = await execAsync(command);

    console.log('LibreOffice output:', stdout);
    if (stderr) console.error('LibreOffice error:', stderr);

    if (!fs.existsSync(outputPdfPath)) {
      throw new Error(`Output PDF not found: ${outputPdfPath}`);
    }

    console.log('PDF generated:', outputPdfPath);

    // Upload .pdf sur S3
    const convertedBucket = 'converted-files';
    const convertedKey = `${conversionId}.pdf`;

    const fileContent = fs.readFileSync(outputPdfPath);

    const uploadCommand = new PutObjectCommand({
      Bucket: convertedBucket,
      Key: convertedKey,
      Body: fileContent,
      ContentType: 'application/pdf',
    });

    await this.s3Client.send(uploadCommand);

    console.log(`PDF uploaded to S3: s3://${convertedBucket}/${convertedKey}`);

    // Génération de la pre-signed URL
    const getObjectCommand = new GetObjectCommand({
      Bucket: convertedBucket,
      Key: convertedKey,
    });

    const signedUrl = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 600 });

    console.log('Pre-signed URL:', signedUrl);

    // Nettoyage des fichiers locaux
    fs.unlinkSync(localDocxPath);
    fs.unlinkSync(outputPdfPath);

    console.log('Local temp files cleaned up.');

    // On return l'URL
    return signedUrl;
  }
}
