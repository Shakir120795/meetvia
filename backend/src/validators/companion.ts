import Joi from 'joi';

export const submitCompanionSchema = Joi.object({
  fullName: Joi.string().max(100).required().messages({
    'any.required': 'Full name is required',
    'string.empty': 'Full name is required',
    'string.max': 'Full name must not exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'any.required': 'Mobile number is required',
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be a valid 10-digit Indian mobile number',
    }),
  city: Joi.string().required().messages({
    'any.required': 'City is required',
    'string.empty': 'City is required',
  }),
  experience: Joi.string().max(1000).required().messages({
    'any.required': 'Experience is required',
    'string.empty': 'Experience is required',
    'string.max': 'Experience must not exceed 1000 characters',
  }),
  whyJoin: Joi.string().max(1000).required().messages({
    'any.required': 'Why join reason is required',
    'string.empty': 'Why join reason is required',
    'string.max': 'Why join reason must not exceed 1000 characters',
  }),
});
