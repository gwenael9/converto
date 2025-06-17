import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConversionResolver } from './conversion.resolver';
import { ConversionService } from './conversion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionEntity } from './entities/conversion.entity';

// const rabbitmqConfig = {
//   host: process.env.RABBITMQ_HOST || 'rabbitmq',
//   port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
//   username: process.env.RABBITMQ_DEFAULT_USER || 'admin',
//   password: process.env.RABBITMQ_DEFAULT_PASS || 'password',
// };

// console.log('rabbitmqConfiiiiiiiiiig', rabbitmqConfig);

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversionEntity]),
    ClientsModule.register([
      {
        name: 'CONVERSION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            // `amqp://${process.env.RABBITMQ_DEFAULT_USER || 'admin'}:${process.env.RABBITMQ_DEFAULT_PASS || 'password'}@${process.env.RABBITMQ_HOST || 'rabbitmq'}:${process.env.RABBITMQ_PORT || '5672'}`,
            // `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`,
            process.env.RABBITMQ_URL,
          ],
          queue: 'convert-docx-to-pdf',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [ConversionResolver, ConversionService],
})
export class ConversionModule {}
