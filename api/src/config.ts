import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  autoLoadEntities: true,
  ...(isDevelopment
    ? {}
    : {
        ssl: {
          rejectUnauthorized: false,
        },
      }),
  synchronize: isDevelopment,
  migrations: [
    join(__dirname, 'migrations', `*.${isDevelopment ? 'ts' : 'js'}`),
  ],
  migrationsRun: true,
};
