import chalk from "chalk";
const getTimestamp = (): string => {
  return new Date().toISOString();
};

const isDevelopment = process.env.NODE_ENV === "development";

const logger = {
  info: (message: string, data: unknown = null) => {
    if (isDevelopment) {
      console.log(
        chalk.green.bold("[INFO]"),
        chalk.cyan(getTimestamp() ),
         " - " ,
          message,
        data ?? ""
      );
    }
  },

  warn: (message: string, data: unknown = null) => {
    if (isDevelopment) {
      console.warn(
        chalk.yellow.bold("[WARN]"),
        chalk.cyan( getTimestamp ),
        "-" ,
        message,
        data ?? ""
      );
    }
  },

  error: (message: string, error: unknown = null) => {
    if (isDevelopment) {
      console.error(
        chalk.red.bold("[ERROR]"),
        chalk.cyan(getTimestamp()),
        "-" ,
        message,
        error ?? ""
      );
    }
  },

  debug: (message: string, data: unknown = null) => {
    if (isDevelopment) {
      console.debug(
        chalk.magenta.bold("[DEBUG]"),
        chalk.cyan(getTimestamp()),
        "-" ,
        message,
        data ?? ""
      );
    }
  },
};

export default logger;