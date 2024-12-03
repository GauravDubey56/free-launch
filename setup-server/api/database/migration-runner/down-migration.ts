import DatabaseConnection from "../connection";
const downMigration = async () => {
  try {
    const connection = await DatabaseConnection.getInstance();
    const migrationName = process.argv[2];
    // await checkInstanceConfig();
    if (!migrationName) {
      await connection.undoLastMigration();
    } else {
      throw new Error("Migration name not needed");
    }
  } catch (error) {
    console.error(error);
  }
};

downMigration();
