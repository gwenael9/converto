import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

@Injectable()
export class ConversionService {
  async convertAndUpload(data: any): Promise<string> {
    const fileName = data?.fileName || 'TEST.docx';

    const inputFilePath = path.resolve(__dirname, '../test-files', fileName);
    const outputDir = path.resolve(__dirname, '../test-files/output');

    console.log('Input file path:', inputFilePath);
    console.log('Output dir:', outputDir);

    if (!fs.existsSync(inputFilePath)) {
      throw new Error(`Input file not found: ${inputFilePath}`);
    }

    const command = `soffice --headless --convert-to pdf "${inputFilePath}" --outdir "${outputDir}"`;

    try {
      console.log('Running command:', command);

      const { stdout, stderr } = await execAsync(command);

      console.log('LibreOffice output:', stdout);
      if (stderr) console.error('LibreOffice error:', stderr);

      const outputFileName = fileName.replace(/\.docx$/, '.pdf');
      const outputFilePath = path.join(outputDir, outputFileName);

      if (!fs.existsSync(outputFilePath)) {
        throw new Error(`Output PDF not found: ${outputFilePath}`);
      }

      console.log('Conversion done. PDF saved at:', outputFilePath);

      return outputFilePath;
    } catch (error) {
      console.error('Error during conversion:', error);
      throw new Error('Conversion failed');
    }
  }
}
