import Joi from 'joi';

export const submitContactSchema = Joi.object({
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
  mobile: Joi.string().allow('', null).pattern(/^\+?[\d\s\-()]+$/).messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),
  serviceType: Joi.string().required().messages({
    'any.required': 'Service type is required',
    'string.empty': 'Service type is required',
  }),
  preferredDate: Joi.date().iso().allow(null).messages({
    'date.format': 'Preferred date must be a valid date',
  }),
  message: Joi.string().max(2000).required().messages({
    'any.required': 'Message is required',
    'string.empty': 'Message is required',
    'string.max': 'Message must not exceed 2000 characters',
  }),
  safetyConfirmed: Joi.boolean().valid(true).required().messages({
    'any.required': 'Safety confirmation is required',
    'any.only': 'You must confirm the safety agreement',
  }),
});
