import { Injectable } from '@nestjs/common';
import { ConversionInput, ConversionType } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { mkdir } from 'fs/promises';

@Injectable()
export class ConversionService {
  private readonly uploadsDir = join(process.cwd(), 'uploads');

  constructor() {
    // Créer le dossier uploads s'il n'existe pas
    mkdir(this.uploadsDir, { recursive: true }).catch(console.error);
  }

  async convertFile(input: ConversionInput): Promise<ConversionOutput> {
    const { filename, mimetype, encoding, createReadStream } = await input.file;
    const conversionId = uuidv4();

    console.log('File details:', { filename, mimetype, encoding });

    // TODO: Traiter le fichier avec createReadStream()
    const stream = createReadStream();

    return {
      id: conversionId,
      status: 'PENDING',
    };
  }

  async getConversionStatus(id: string): Promise<ConversionOutput> {
    return {
      id,
      status: 'PENDING',
    };
  }
}
