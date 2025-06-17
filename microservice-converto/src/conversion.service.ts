import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import {
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const execAsync = promisify(exec);
const TEMP_DIR = path.resolve(__dirname, '../../tmp');

@Injectable()
export class ConversionService {
  private s3Client: S3Client;
  private s3PublicClient: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });

    this.s3PublicClient = new S3Client({
      region: 'us-east-1',
      endpoint: process.env.S3_PUBLIC_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
      },
    });
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`--> Bucket "${bucketName}" already exists.`);
    } catch (err) {
      console.warn(`--> Bucket "${bucketName}" not found. Creating it...`);
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
      console.log(`--> Bucket "${bucketName}" created successfully.`);
    }
  }

  private getPublicUrl(internalUrl: string): string {
    return internalUrl.replace(
      process.env.S3_ENDPOINT || '',
      process.env.S3_PUBLIC_ENDPOINT || '',
    );
  }

  async convertAndUploadFromS3(
    bucket: string,
    key: string,
    conversionId: string,
  ): Promise<{ url: string }> {
    console.log(
      `Starting conversion for s3://${bucket}/${key}, conversionId=${conversionId}`,
    );

    const tempDir = path.join(TEMP_DIR, conversionId);
    fs.mkdirSync(tempDir, { recursive: true });

    const localDocxPath = path.join(tempDir, `${conversionId}.docx`);
    const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const response = await this.s3Client.send(getCommand);
    const writeStream = fs.createWriteStream(localDocxPath);
    const bodyStream = response.Body as any;

    await new Promise<void>((resolve, reject) => {
      bodyStream.pipe(writeStream);
      bodyStream.on('error', reject);
      writeStream.on('finish', () => {
        writeStream.close();
        setTimeout(resolve, 200); // délai post-écriture
      });
    });

    console.log(`File downloaded to: ${localDocxPath}`);

    if (!fs.existsSync(localDocxPath)) {
      throw new Error(`Fichier .docx introuvable après téléchargement`);
    }

    const stats = fs.statSync(localDocxPath);
    console.log(`Fichier DOCX taille: ${stats.size} octets`);

    if (stats.size < 1000) {
      throw new Error(`Fichier .docx trop petit ou corrompu (${stats.size} octets)`);
    }

    await new Promise((resolve) => setTimeout(resolve, 200)); 

    const outputPdfPath = path.join(tempDir, `${conversionId}.pdf`);
    const libreOfficeProfileDir = path.join(tempDir, 'libreoffice-profile');
    fs.mkdirSync(libreOfficeProfileDir, { recursive: true });

    const command = `soffice --headless -env:UserInstallation=file://${libreOfficeProfileDir} --convert-to pdf "${localDocxPath}" --outdir "${tempDir}"`;


    console.log('Running command:', command);

    try {
      const { stdout, stderr } = await execAsync(command);
      console.log('LibreOffice output:', stdout);
      if (stderr) console.error('LibreOffice error:', stderr);
    } catch (err) {
      console.error(`Erreur lors de la conversion LibreOffice :`, err);
      throw new Error(`Échec de la conversion LibreOffice pour ${conversionId}`);
    }

    if (!fs.existsSync(outputPdfPath)) {
      throw new Error(`Output PDF not found: ${outputPdfPath}`);
    }

    console.log('PDF generated:', outputPdfPath);
    console.log('bucket', process.env.S3_BUCKET_CONVERT);

    const convertedBucket = process.env.S3_BUCKET_CONVERT;
    const convertedKey = `${conversionId}.pdf`;

    if (!convertedBucket) {
      throw new Error('S3_BUCKET_CONVERT must be defined in the environment');
    }

    await this.ensureBucketExists(convertedBucket);
    const fileContent = fs.readFileSync(outputPdfPath);

    const uploadCommand = new PutObjectCommand({
      Bucket: convertedBucket,
      Key: convertedKey,
      Body: fileContent,
      ContentType: 'application/pdf',
    });

    await this.s3Client.send(uploadCommand);
    console.log(`PDF uploaded to S3: s3://${convertedBucket}/${convertedKey}`);

    const getObjectCommand = new GetObjectCommand({
      Bucket: convertedBucket,
      Key: convertedKey,
    });

    const signedUrl = await getSignedUrl(this.s3PublicClient, getObjectCommand, {
      expiresIn: 600,
    });

    console.log('Pre-signed URL:', signedUrl);

    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('Local temp files cleaned up.');

    return { url: signedUrl };
  }
}
