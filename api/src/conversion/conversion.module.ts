import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConversionResolver } from './conversion.resolver';
import { ConversionService } from './conversion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversionEntity } from './entities/conversion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConversionEntity]),
    ClientsModule.register([
      {
        name: 'CONVERSION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'], // le service RabbitMQ sera nommé "rabbitmq" dans docker-compose
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
