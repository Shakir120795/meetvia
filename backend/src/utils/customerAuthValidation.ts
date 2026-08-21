import Joi from 'joi';

export const otpRequestSchema = Joi.object({
  channel: Joi.string().valid('mobile', 'email').required(),
  identifier: Joi.alternatives().conditional('channel', {
    is: 'email',
    then: Joi.string().trim().email().required(),
    otherwise: Joi.string().trim().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  }),
  purpose: Joi.string().valid('login', 'signup').default('login'),
}).options({ abortEarly: false, stripUnknown: true });

export const otpVerifySchema = Joi.object({
  requestId: Joi.string().trim().min(1).required(),
  code: Joi.string().trim().pattern(/^\d{6}$/).required(),
}).options({ abortEarly: false, stripUnknown: true });

export const bearerTokenSchema = Joi.string().trim().min(32).required();

export function validationMessages(error: Joi.ValidationError) {
  return error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));
}
