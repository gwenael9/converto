import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { FileType } from '../entities/conversion.entity';

registerEnumType(FileType, {
  name: 'FileType',
  description: 'Type de fichier',
});

@InputType({ description: "Données d'entrée pour la conversion de fichier" })
export class ConversionInput {
  @Field(() => GraphQLUpload, {
    description:
      'Le fichier à convertir (PDF ou DOCX selon le type de conversion)',
  })
  @IsNotEmpty()
  file: Promise<FileUpload>;

  @Field(() => FileType, {
    description: 'Le type de fichier source à convertir',
  })
  @IsEnum(FileType)
  sourceType: FileType;

  @Field(() => FileType, {
    description: 'Le type de fichier cible',
  })
  @IsEnum(FileType)
  targetType: FileType;
}
