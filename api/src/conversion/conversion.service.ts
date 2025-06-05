import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { ConversionInput } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';
import {
  ConversionEntity,
  ConversionStatus,
} from './entities/conversion.entity';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';

@Injectable()
export class ConversionService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  private s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://minio:9000',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
    },
  });

  constructor(
    @InjectRepository(ConversionEntity)
    private conversionRepository: Repository<ConversionEntity>,

    @Inject('CONVERSION_SERVICE')
    private readonly conversionClient: ClientProxy,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    mkdir(this.uploadsDir, { recursive: true }).catch(console.error);
  }

  async convertFile(input: ConversionInput): Promise<ConversionOutput> {
    const { filename, mimetype, encoding, createReadStream } = await input.file;

    console.log('File details:', { filename, mimetype, encoding });

    // Étape 1 : Sauvegarder dans la BDD
    const conversion = this.conversionRepository.create({
      status: ConversionStatus.PENDING,
      sourceType: input.sourceType,
      targetType: input.targetType,
      fileName: filename,
    });

    await this.conversionRepository.save(conversion);

    // Étape 2 : Uploader sur S3
    const bucketName = process.env.S3_BUCKET;
    const key = `${conversion.id}-${filename}`;

    // Sauvegarder temporairement en local
    const localPath = join(this.uploadsDir, `${conversion.id}-${filename}`);

    const stream = createReadStream();
    const writeStream = fs.createWriteStream(localPath);

    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream);
      stream.on('error', reject);
      writeStream.on('finish', resolve);
    });

    console.log(`File saved locally: ${localPath}`);

    // Lire en buffer
    const fileBuffer = await fs.promises.readFile(localPath);

    // Upload S3 avec ContentLength
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ContentLength: fileBuffer.length,
    });

    await this.s3Client.send(uploadCommand);

    console.log(`File uploaded to S3: ${bucketName}/${key}`);

    // Nettoyer le fichier local
    await fs.promises.unlink(localPath);

    console.log(`Local file deleted: ${localPath}`);

    // Étape 3 : Envoyer message RabbitMQ
    const message = {
      sourceS3: {
        bucket: bucketName,
        key: key,
      },
      conversionId: conversion.id,
    };

    console.log('Sending message to conversion microservice:', message);

    this.conversionClient.emit('convert-docx-to-pdf', message);

    // Retourner l'output
    return {
      id: conversion.id,
      status: ConversionStatus.PENDING,
    };
  }

  async getConversionStatus(id: string): Promise<ConversionOutput> {
    const conversion = await this.conversionRepository.findOne({
      where: { id },
    });

    if (!conversion) {
      throw new Error('Conversion non trouvée');
    }

    return {
      id: conversion.id,
      status: conversion.status,
      convertedFileUrl: undefined, // TODO: tu le rempliras quand la conversion sera faite
    };
  }
}
