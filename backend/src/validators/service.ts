import Joi from 'joi';

export const createServiceSchema = Joi.object({
  title: Joi.string().max(100).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 100 characters',
  }),
  description: Joi.string().max(500).required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required',
    'string.max': 'Description must not exceed 500 characters',
  }),
  duration: Joi.string().allow('', null),
  locationType: Joi.string().valid('Public', 'Virtual', 'Flexible').required().messages({
    'any.required': 'Location type is required',
    'any.only': 'Location type must be one of: Public, Virtual, Flexible',
  }),
  image: Joi.string().allow('', null),
  video: Joi.string().allow('', null),
  thumbnail: Joi.string().allow('', null),
  whatsIncluded: Joi.array().items(Joi.string()),
  buttonText: Joi.string().allow('', null),
  buttonLink: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});

export const updateServiceSchema = Joi.object({
  title: Joi.string().max(100).messages({
    'string.max': 'Title must not exceed 100 characters',
  }),
  description: Joi.string().max(500).messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  duration: Joi.string().allow('', null),
  locationType: Joi.string().valid('Public', 'Virtual', 'Flexible').messages({
    'any.only': 'Location type must be one of: Public, Virtual, Flexible',
  }),
  image: Joi.string().allow('', null),
  video: Joi.string().allow('', null),
  thumbnail: Joi.string().allow('', null),
  whatsIncluded: Joi.array().items(Joi.string()),
  buttonText: Joi.string().allow('', null),
  buttonLink: Joi.string().allow('', null),
  isFeatured: Joi.boolean(),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});
