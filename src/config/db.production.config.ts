import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

export default (): PostgresConnectionOptions => ({
  type: 'postgres',
  url: process.env.PRODUCTION_DATABASE_URL,
  entities: [__dirname + './../**/*.entity.{js,ts}'],
  synchronize: false,
});
