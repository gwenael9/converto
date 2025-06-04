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

  async convertAndUpload(data: any): Promise<string> {
    // Simulation : on reçoit un "chemin local" (plus tard ce sera une URL S3)
    const localDocxPath = data?.localPath || path.resolve(__dirname, '../test-files/TEST.docx');

    console.log('Input file path:', localDocxPath);

    if (!fs.existsSync(localDocxPath)) {
      throw new Error(`Input file not found: ${localDocxPath}`);
    }

    const outputDir = path.dirname(localDocxPath);

    const command = `soffice --headless --convert-to pdf "${localDocxPath}" --outdir "${outputDir}"`;

    try {
      console.log('Running command:', command);

      const { stdout, stderr } = await execAsync(command);

      console.log('LibreOffice output:', stdout);
      if (stderr) console.error('LibreOffice error:', stderr);

      const fileName = path.basename(localDocxPath);
      const outputFileName = fileName.replace(/\.docx$/, '.pdf');
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputFilePath)) {
        throw new Error(`Output PDF not found: ${outputFilePath}`);
      }

      console.log('Conversion done. PDF saved at:', outputFilePath);

      // Upload vers S3
      const bucketName = 'converted-files';
      const key = outputFileName;

      const fileContent = fs.readFileSync(outputFilePath);

      const uploadCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/pdf',
      });

      await this.s3Client.send(uploadCommand);

      console.log(`File uploaded to S3: ${bucketName}/${key}`);

      fs.unlinkSync(outputFilePath);
      console.log(`Local file deleted: ${outputFilePath}`);

      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 600 });

      console.log('Pre-signed URL:', signedUrl);

      return signedUrl;
    } catch (error) {
      console.error('Error during conversion or upload:', error);
      throw new Error('Conversion and upload failed');
    }
  }
}
