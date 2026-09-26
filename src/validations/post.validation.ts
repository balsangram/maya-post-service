import Joi from "joi";

// ==============================
// Create Post
// ==============================

export const createPostValidation = Joi.object({
  description: Joi.string()
    .trim()
    .max(5000)
    .allow("")
    .optional(),
});

// ==============================
// Edit Post
// ==============================

export const editPostValidation = Joi.object({
  description: Joi.string()
    .trim()
    .max(5000)
    .allow("")
    .optional(),
}).min(1);