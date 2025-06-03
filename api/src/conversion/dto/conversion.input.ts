import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

export enum ConversionType {
  PDF_TO_DOCX = 'PDF_TO_DOCX',
  DOCX_TO_PDF = 'DOCX_TO_PDF',
}

registerEnumType(ConversionType, {
  name: 'ConversionType',
  description: 'Type de conversion à effectuer sur le fichier',
});

@InputType({ description: "Données d'entrée pour la conversion de fichier" })
export class ConversionInput {
  @Field(() => GraphQLUpload, {
    description:
      'Le fichier à convertir (PDF ou DOCX selon le type de conversion)',
  })
  @IsNotEmpty()
  file: Promise<FileUpload>;

  @Field(() => ConversionType, {
    description:
      'Le type de conversion à effectuer (PDF vers DOCX ou DOCX vers PDF)',
  })
  @IsEnum(ConversionType)
  conversionType: ConversionType;
}
