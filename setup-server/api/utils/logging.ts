import fs from "fs";

class Logger {
  static logFile = "app.log";
  customFilename = "";
  constructor(logFilename: string) {
    this.customFilename = logFilename;
  }
  static error(...message: any[]) {
    console.error(...message);
  }
  static log(...message: any[]) {
    try {
      const date = new Date().toISOString();
      if (process.env.LOG_ENV == "local") {
        console.log(...message);
      } else {
        fs.appendFileSync(this.logFile, `${date} - ${message.join(",")}\\\\n`);
      }
    } catch (error: any) {
      console.log(...message);
      console.error(`Error in logging class ${error.message}`, error);
    }
  }
  log(...message: any[]) {
    try {
      const date = new Date().toISOString();
      if (process.env.LOG_ENV == "local") {
        console.log(...message);
      } else {
        fs.appendFileSync(
          this.customFilename,
          `${date} - ${message.join(",")}\\\\n`
        );
      }
    } catch (error: any) {
      console.log(...message);
      console.error(`Error in logging class ${error.message}`, error);
    }
  }
}

export default Logger;
