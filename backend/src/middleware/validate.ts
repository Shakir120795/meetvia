import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation middleware factory.
 * Wraps a Joi schema and validates req.body against it.
 * Returns 400 with structured error on validation failure.
 */
export function validate(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.details[0].message,
          field: error.details[0].path[0],
          code: 'VALIDATION_ERROR',
        },
      });
    }
    next();
  };
}

export default validate;
