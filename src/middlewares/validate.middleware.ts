import type { Request, Response, NextFunction } from "express";
const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map(
          (item: any) => item.message
        ),
      });
    }

    req.body = value;

    next();
  };
};

export default validate;
