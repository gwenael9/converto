import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'apollo-require-preflight',
    ],
    exposedHeaders: ['Access-Control-Allow-Credentials'],
  });

  await app.listen(process.env.PORT_API);
  console.log(
    `Server ready at http://localhost:${process.env.PORT_API}/graphql`,
  );
}
bootstrap();
