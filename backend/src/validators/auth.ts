import Joi from 'joi';

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
    'string.empty': 'Email is required',
  }),
  password: Joi.string().min(1).required().messages({
    'any.required': 'Password is required',
    'string.empty': 'Password is required',
    'string.min': 'Password is required',
  }),
});

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  purpose: Joi.string().valid('LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET').default('LOGIN')
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must contain only numbers',
    'any.required': 'OTP is required',
  }),
  purpose: Joi.string().valid('LOGIN', 'EMAIL_VERIFICATION', 'PASSWORD_RESET').default('LOGIN')
});

export const companionRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    'any.required': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 8 characters',
  }),
  phone: Joi.string().optional(),
  bio: Joi.string().optional(),
  cityId: Joi.string().optional(),
  gender: Joi.string().optional(),
  languagesSpoken: Joi.array().items(Joi.string()).optional()
});

export const companionLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});
