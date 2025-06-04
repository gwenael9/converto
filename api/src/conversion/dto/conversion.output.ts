import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Résultat de la conversion de fichier' })
export class ConversionOutput {
  @Field(() => String, {
    description: 'Identifiant unique de la conversion',
  })
  id: string;

  @Field(() => String, {
    description: 'Statut actuel de la conversion (PENDING, COMPLETED, FAILED)',
  })
  status: string;

  @Field(() => String, {
    nullable: true,
    description:
      'URL du fichier converti, disponible une fois la conversion terminée',
  })
  convertedFileUrl?: string;

  @Field(() => String, {
    nullable: true,
    description: "Message d'erreur en cas d'échec de la conversion",
  })
  error?: string;
}
