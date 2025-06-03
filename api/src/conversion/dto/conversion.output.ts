import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConversionOutput {
  @Field(() => String)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => String, { nullable: true })
  convertedFileUrl?: string;

  @Field(() => String, { nullable: true })
  error?: string;
}
