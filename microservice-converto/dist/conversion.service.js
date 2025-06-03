"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversionService = void 0;
const common_1 = require("@nestjs/common");
const child_process_1 = require("child_process");
const util_1 = require("util");
const path = require("path");
const fs = require("fs");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ConversionService = class ConversionService {
    async convertAndUpload(data) {
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
            if (stderr)
                console.error('LibreOffice error:', stderr);
            const outputFileName = fileName.replace(/\.docx$/, '.pdf');
            const outputFilePath = path.join(outputDir, outputFileName);
            if (!fs.existsSync(outputFilePath)) {
                throw new Error(`Output PDF not found: ${outputFilePath}`);
            }
            console.log('Conversion done. PDF saved at:', outputFilePath);
            return outputFilePath;
        }
        catch (error) {
            console.error('Error during conversion:', error);
            throw new Error('Conversion failed');
        }
    }
};
exports.ConversionService = ConversionService;
exports.ConversionService = ConversionService = __decorate([
    (0, common_1.Injectable)()
], ConversionService);
//# sourceMappingURL=conversion.service.js.map