import { exec } from "child_process";
const createMigration = () => {
  const migrationName = process.argv[2];
  if (migrationName) {
    const createMigrationCommand = `typeorm migration:create ./api/database/migrations/${migrationName}`;
    exec(createMigrationCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("Create Migration error");
        console.error(error);
        return;
      }
      console.log(stdout);
    });
  } else {
    throw new Error("Migration name needed");
  }
};


createMigration();