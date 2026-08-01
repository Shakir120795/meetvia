import Joi from 'joi';

export const updateSiteSettingsSchema = Joi.object({
  siteName: Joi.string().max(100).required().messages({
    'any.required': 'Site name is required',
    'string.empty': 'Site name is required',
    'string.max': 'Site name must not exceed 100 characters',
  }),
  siteLogo: Joi.string().allow('', null),
  favicon: Joi.string().allow('', null),
  metaTitle: Joi.string().max(60).required().messages({
    'any.required': 'Meta title is required',
    'string.empty': 'Meta title is required',
    'string.max': 'Meta title must not exceed 60 characters',
  }),
  metaDescription: Joi.string().max(160).allow('', null).messages({
    'string.max': 'Meta description must not exceed 160 characters',
  }),
  contactEmail: Joi.string().email().allow('', null).messages({
    'string.email': 'Please provide a valid email address',
  }),
  contactPhone: Joi.string().allow('', null),
  whatsappNumber: Joi.string().allow('', null),
  whatsappMessage: Joi.string().allow('', null),
  safetyCheckboxText: Joi.string().allow('', null),
});
