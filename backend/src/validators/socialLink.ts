import Joi from 'joi';

export const createSocialLinkSchema = Joi.object({
  platform: Joi.string().required().messages({
    'any.required': 'Platform is required',
    'string.empty': 'Platform is required',
  }),
  url: Joi.string().uri().required().messages({
    'any.required': 'URL is required',
    'string.empty': 'URL is required',
    'string.uri': 'Please provide a valid URL',
  }),
  iconIdentifier: Joi.string().required().messages({
    'any.required': 'Icon identifier is required',
    'string.empty': 'Icon identifier is required',
  }),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});

export const updateSocialLinkSchema = Joi.object({
  platform: Joi.string().messages({}),
  url: Joi.string().uri().messages({
    'string.uri': 'Please provide a valid URL',
  }),
  iconIdentifier: Joi.string().messages({}),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});
