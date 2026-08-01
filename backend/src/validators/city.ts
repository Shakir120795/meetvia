import Joi from 'joi';

export const createCitySchema = Joi.object({
  cityName: Joi.string().max(100).required().messages({
    'any.required': 'City name is required',
    'string.empty': 'City name is required',
    'string.max': 'City name must not exceed 100 characters',
  }),
  state: Joi.string().max(100).required().messages({
    'any.required': 'State is required',
    'string.empty': 'State is required',
    'string.max': 'State must not exceed 100 characters',
  }),
  country: Joi.string().max(100).required().messages({
    'any.required': 'Country is required',
    'string.empty': 'Country is required',
    'string.max': 'Country must not exceed 100 characters',
  }),
  status: Joi.string().valid('active', 'inactive').messages({
    'any.only': 'Status must be either active or inactive',
  }),
  displayOrder: Joi.number().integer(),
});

export const updateCitySchema = Joi.object({
  cityName: Joi.string().max(100).messages({
    'string.max': 'City name must not exceed 100 characters',
  }),
  state: Joi.string().max(100).messages({
    'string.max': 'State must not exceed 100 characters',
  }),
  country: Joi.string().max(100).messages({
    'string.max': 'Country must not exceed 100 characters',
  }),
  status: Joi.string().valid('active', 'inactive').messages({
    'any.only': 'Status must be either active or inactive',
  }),
  displayOrder: Joi.number().integer(),
});
