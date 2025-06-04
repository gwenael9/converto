import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ConversionService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor(
    @InjectRepository(ConversionEntity)
    private conversionRepository: Repository<ConversionEntity>,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    mkdir(this.uploadsDir, { recursive: true }).catch(console.error);
  }

  async convertFile(input: ConversionInput): Promise<ConversionOutput> {
    const { filename, mimetype, encoding } = await input.file;

    console.log('File details:', { filename, mimetype, encoding });

    const conversion = this.conversionRepository.create({
      status: ConversionStatus.PENDING,
      sourceType: input.sourceType,
      targetType: input.targetType,
      fileName: filename,
    });

    await this.conversionRepository.save(conversion);

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
    };
  }
}
