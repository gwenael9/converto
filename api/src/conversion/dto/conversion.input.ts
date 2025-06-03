import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';

export enum ConversionType {
  PDF_TO_DOCX = 'PDF_TO_DOCX',
  DOCX_TO_PDF = 'DOCX_TO_PDF',
}

registerEnumType(ConversionType, {
  name: 'ConversionType',
  description: 'The type of conversion to perform',
});

@InputType()
export class ConversionInput {
  @Field(() => GraphQLUpload)
  @IsNotEmpty()
  file: Promise<FileUpload>;

  @Field(() => ConversionType)
  @IsEnum(ConversionType)
  conversionType: ConversionType;
}
