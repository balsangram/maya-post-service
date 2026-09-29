import express ,{Request , Response ,NextFunction} from "express";

import corsMiddleware from "./middlewares/cors.middleware.ts";
import postRoutes from "./routes/post.routes.ts";
import ApiError from "./utils/ApiError.ts";
import errorMiddleware from "./middlewares/error.middleware.ts";

const app = express();

/* ==============================
   Global Middleware
============================== */

app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* ==============================
   Health Check
============================== */

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    service: "Post Service",
    status: "healthy",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Post Service API is running",
  });
});

app.get("/post/health", (req : Request, res : Response) => {
  res.json({
    success: true,
    message: "Post Service API is running",
  });
});

/* ==============================
   API Routes
============================== */

app.use("/api/post", postRoutes);

/* ==============================
   404 Handler
============================== */

app.use((req: Request, res : Response, next : NextFunction) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
});

// IMPORTANT: error middleware must be last
app.use(errorMiddleware);

export default app;
