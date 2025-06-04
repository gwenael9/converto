import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  await app.listen(process.env.PORT_API);
  console.log(
    `🚀 Server ready at http://localhost:${process.env.PORT_API}/graphql`,
  );
}
bootstrap();
