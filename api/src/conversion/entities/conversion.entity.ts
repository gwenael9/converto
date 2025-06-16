import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ConversionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum FileType {
  PDF = 'PDF',
  DOCX = 'DOCX',
}

@ObjectType()
@Entity('conversions')
export class ConversionEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ConversionStatus)
  @Column({
    type: 'enum',
    enum: ConversionStatus,
    default: ConversionStatus.PENDING,
  })
  status: ConversionStatus;

  @Field(() => FileType)
  @Column({
    type: 'enum',
    enum: FileType,
  })
  sourceType: FileType;

  @Field(() => FileType)
  @Column({
    type: 'enum',
    enum: FileType,
  })
  targetType: FileType;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  fileName: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  convertedFileUrl: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;
}
