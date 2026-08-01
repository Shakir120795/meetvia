import Joi from 'joi';

const hexColor = Joi.string()
  .pattern(/^#[0-9A-Fa-f]{6}$/)
  .messages({
    'string.pattern.base': '{{#label}} must be a valid hex color code (#RRGGBB)',
  });

export const updateThemeSchema = Joi.object({
  activePreset: Joi.string()
    .valid('futuristic-blue', 'luxury-dark', 'clean-white', 'custom')
    .messages({
      'any.only': 'activePreset must be one of: futuristic-blue, luxury-dark, clean-white, custom',
    }),
  primaryColor: hexColor.required().messages({
    'any.required': 'Primary color is required',
  }),
  secondaryColor: hexColor.required().messages({
    'any.required': 'Secondary color is required',
  }),
  accentColor: hexColor.required().messages({
    'any.required': 'Accent color is required',
  }),
  backgroundColor: hexColor.required().messages({
    'any.required': 'Background color is required',
  }),
  textColor: hexColor.required().messages({
    'any.required': 'Text color is required',
  }),
  fontFamily: Joi.string().required().messages({
    'any.required': 'Font family is required',
    'string.empty': 'Font family is required',
  }),
  borderRadius: Joi.number().integer().min(0).max(32).messages({
    'number.min': 'Border radius must be between 0 and 32',
    'number.max': 'Border radius must be between 0 and 32',
  }),
  glassmorphismIntensity: Joi.number().integer().min(0).max(100).messages({
    'number.min': 'Glassmorphism intensity must be between 0 and 100',
    'number.max': 'Glassmorphism intensity must be between 0 and 100',
  }),
});
