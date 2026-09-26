import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const cors = require("cors");

const corsMiddleware = cors({
  origin: true,
  credentials: true,
});

export default corsMiddleware;