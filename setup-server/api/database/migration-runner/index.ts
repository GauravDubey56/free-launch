import DEFAULT_DB_CONFIG from "../config";
import { DataSource } from "typeorm";

const dataSource = new DataSource(DEFAULT_DB_CONFIG);
export default dataSource;
