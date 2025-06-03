import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(3000);
  console.log('HTTP server listening on port 3000');
}
bootstrap();

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
//     transport: Transport.RMQ,
//     options: {
//       urls: ['amqp://localhost:5672'], // ton URL RabbitMQ
//       queue: 'convert_queue',          // nom de la queue
//       queueOptions: {
//         durable: true,
//       },
//     },
//   });

//   await app.listen();
//   console.log('Microservice Converto is listening to RabbitMQ...');
// }
// bootstrap();

