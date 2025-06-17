import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('Connexion à RabbitMQ avec :', process.env.RABBITMQ_DEFAULT_USER);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${process.env.RABBITMQ_DEFAULT_USER}:${process.env.RABBITMQ_DEFAULT_PASS}@rabbitmq:5672`,
      ],
      queue: 'convert-docx-to-pdf',
      queueOptions: {
        durable: true,
      },
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  console.log('Microservice RabbitMQ is now listening...');

  const port = process.env.PORT_MICROSERVICE || 3000;
  await app.listen(port);
  console.log(`HTTP server ready at http://localhost:${port}`);
}

bootstrap();
