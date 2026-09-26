import http from "http";
import app from "./app.ts";
import connectDB from "./config/db.ts";
import env from "./config/env.js";
import logger from "./utils/logger.ts";


let server : http.Server | undefined;

const startServer = async () => {
  try {
    // Auth service connects to DB
    await connectDB();

    server = http.createServer(app);

    server.listen(
      { port : env.PORT, 
        host : "0.0.0.0"
      }, () => {
      console.log(`🔐 Auth Service running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();