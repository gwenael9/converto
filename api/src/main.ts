import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowedOrigins = isDevelopment
    ? ['http://localhost:3001']
    : [process.env.FRONTEND_URL || 'http://157.245.45.19'];

  app.enableCors({
    origin: allowedOrigins,
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
