import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connexion à RabbitMQ pour les messages d'upload
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbitmq:5672`,
      ],
      queue: 'upload-docx-request',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });

  // Démarrage du microservice RabbitMQ
  await app.startAllMicroservices();
  console.log('Microservice RabbitMQ (upload-docx-request) is now listening...');

  // Configuration CORS pour l’API HTTP
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

  // Lancement du serveur HTTP
  await app.listen(process.env.PORT_API);
  console.log(`Server ready at http://localhost:${process.env.PORT_API}/graphql`);
}

bootstrap();
