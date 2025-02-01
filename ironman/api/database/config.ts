import { DataSourceOptions } from "typeorm";
import * as constants from "../config/constants";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
const DEFAULT_DB_CONFIG: PostgresConnectionOptions | DataSourceOptions = {
  type: "cockroachdb",
  host: constants.DB_HOST,
  username: constants.DB_USER,
  password: constants.DB_PASSWORD,
  port: constants.DB_PORT,
  database: constants.DB_NAME,
  // url: constants.DB_CONNECT_URL,
  ssl: true,
  extra: {
    options: "--cluster=eager-goose-2110",
    application_name: "algojamDB",
  },
  migrationsTableName: "migrations",
  synchronize: true,
  logging: false,
  entities: ["dist/database/entity/**/*.js"],
  migrations: [__dirname + "/entity/**/*.js"],
  timeTravelQueries: false,
};

export default DEFAULT_DB_CONFIG;
