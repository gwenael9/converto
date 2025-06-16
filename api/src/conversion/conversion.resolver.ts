import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ConversionService } from './conversion.service';
import { ConversionInput } from './dto/conversion.input';
import { ConversionOutput } from './dto/conversion.output';

@Resolver(() => ConversionOutput)
export class ConversionResolver {
  constructor(private readonly conversionService: ConversionService) {}

  @Mutation(() => ConversionOutput, {
    description: 'Convertit un fichier PDF en DOCX ou vice versa',
  })
  async convertFile(
    @Args('input', { description: "Données d'entrée pour la conversion" })
    input: ConversionInput,
  ): Promise<ConversionOutput> {
    console.log('Resolver input:', input);
    return await this.conversionService.convertFile(input);
  }

  @Query(() => ConversionOutput, {
    description: "Récupère le statut d'une conversion",
  })
  async getConversionStatus(
    @Args('id', { description: 'Identifiant de la conversion' }) id: string,
  ): Promise<ConversionOutput> {
    return this.conversionService.getConversionStatus(id);
  }
}
