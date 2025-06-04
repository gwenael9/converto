import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`HTTP server ready at http://localhost:${port}`);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'convert-docx-to-pdf',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  console.log('Microservice RabbitMQ is now listening...');
}
bootstrap();
