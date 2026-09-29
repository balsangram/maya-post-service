import http from "http";
import app from "./app.ts";
import connectDB from "./config/db.ts";
import env from "./config/env.ts";
import logger from "./utils/logger.ts";


let server : http.Server | undefined;

const startServer = async () => {
  try {
    // Post service connects to DB
    await connectDB();

    server = http.createServer(app);

    server.listen(
      {
        port: env.PORT,
        host: "0.0.0.0",
      },
      () => {
        logger.info(`🚀 Post Service running on port ${env.PORT}`);
      }
    );

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      if (server) {
        server.close(() => {
          logger.info("HTTP server closed.");
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();