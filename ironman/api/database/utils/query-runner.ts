import { DataSource } from "typeorm";

class QueryRunnerWrapper {
  queryRunner: any;
  constructor(source: DataSource) {
    this.queryRunner = source.createQueryRunner();
  }
  getQueryRunner() {
    return this.queryRunner;
  }
  connect() {
    this.queryRunner.connect();
  }
  async startTransaction() {
    return await this.queryRunner.startTransaction();
  }
  async commitTransaction() {
    return await this.queryRunner.commitTransaction();
  }
  async rollbackTransaction() {
    return await this.queryRunner.rollbackTransaction();
  }
}

export default QueryRunnerWrapper;
