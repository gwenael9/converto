import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ConversionService } from './conversion.service';
import { ConversionInput } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';
import { FileUpload } from 'graphql-upload-ts';

@Resolver(() => ConversionOutput)
export class ConversionResolver {
  constructor(private readonly conversionService: ConversionService) {}

  @Mutation(() => ConversionOutput)
  async convertFile(
    @Args('input') input: ConversionInput,
  ): Promise<ConversionOutput> {
    console.log('Resolver input:', input);
    return await this.conversionService.convertFile(input);
  }

  @Query(() => ConversionOutput)
  async getConversionStatus(@Args('id') id: string): Promise<ConversionOutput> {
    return this.conversionService.getConversionStatus(id);
  }
}
