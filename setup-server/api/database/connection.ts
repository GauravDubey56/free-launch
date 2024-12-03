import { DataSource, DataSourceOptions } from "typeorm";
import DEFAULT_DB_CONFIG from "./config";
import { DB_CONNECT_URL } from "../config/constants";
class DatabaseConnection extends DataSource {
  #dbConnectionUrl: string;
  private static connection: DataSource;
  private static dataSource: DataSource;
  private constructor(url: string, dbConfig: DataSourceOptions) {
    super(dbConfig);
    this.#dbConnectionUrl = url;
  }
  static async getInstance(url?: string) {
    if (!url) {
      url = DB_CONNECT_URL;
    }
    if (this.dataSource) {
      return this.dataSource
    }
  
    this.connection = new DatabaseConnection(url, DEFAULT_DB_CONFIG);
    this.dataSource = await this.connection.initialize();
    return this.dataSource;
  }
}

export default DatabaseConnection;
