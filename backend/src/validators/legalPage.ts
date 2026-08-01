import Joi from 'joi';

export const updateLegalPageSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
  }),
  content: Joi.string().max(100000).required().messages({
    'any.required': 'Content is required',
    'string.empty': 'Content is required',
    'string.max': 'Content must not exceed 100000 characters',
  }),
});
