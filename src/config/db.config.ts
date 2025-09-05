import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export default (): PostgresConnectionOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + './../**/*.entity.{js,ts}'],
  synchronize: true,
});
