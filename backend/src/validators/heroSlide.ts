import Joi from 'joi';

export const createHeroSlideSchema = Joi.object({
  heading: Joi.string().max(200).required().messages({
    'any.required': 'Heading is required',
    'string.empty': 'Heading is required',
    'string.max': 'Heading must not exceed 200 characters',
  }),
  subtitle: Joi.string().max(500).allow('').messages({
    'string.max': 'Subtitle must not exceed 500 characters',
  }),
  backgroundImage: Joi.string().allow('', null),
  backgroundVideo: Joi.string().allow('', null),
  overlayOpacity: Joi.number().min(0).max(100).messages({
    'number.min': 'Overlay opacity must be between 0 and 100',
    'number.max': 'Overlay opacity must be between 0 and 100',
  }),
  includesList: Joi.array().items(Joi.string()),
  ctaText: Joi.string().allow('', null),
  ctaLink: Joi.string().allow('', null),
  displayOrder: Joi.number().integer(),
  isVisible: Joi.boolean(),
});

export const updateHeroSlideSchema = Joi.object({
  heading: Joi.string().max(200).messages({
    'string.max': 'Heading must not exceed 200 characters',
  }),
  subtitle: Joi.string().max(500).allow('').messages({
    'string.max': 'Subtitle must not exceed 500 characters',
  }),
  backgroundImage: Joi.string().allow('', null),
  backgroundVideo: Joi.string().allow('', null),
  overlayOpacity: Joi.number().min(0).max(100).messages({
    'number.min': 'Overlay opacity must be between 0 and 100',
    'number.max': 'Overlay opacity must be between 0 and 100',
  }),
  includesList: Joi.array().items(Joi.string()),
  ctaText: Joi.string().allow('', null),
  ctaLink: Joi.string().allow('', null),
  displayOrder: Joi.number().integer(),
  isVisible: Joi.boolean(),
});
