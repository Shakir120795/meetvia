import Joi from 'joi';

export const createFaqSchema = Joi.object({
  question: Joi.string().max(200).required().messages({
    'any.required': 'Question is required',
    'string.empty': 'Question is required',
    'string.max': 'Question must not exceed 200 characters',
  }),
  answer: Joi.string().max(2000).required().messages({
    'any.required': 'Answer is required',
    'string.empty': 'Answer is required',
    'string.max': 'Answer must not exceed 2000 characters',
  }),
  displayOrder: Joi.number().integer(),
});

export const updateFaqSchema = Joi.object({
  question: Joi.string().max(200).messages({
    'string.max': 'Question must not exceed 200 characters',
  }),
  answer: Joi.string().max(2000).messages({
    'string.max': 'Answer must not exceed 2000 characters',
  }),
  displayOrder: Joi.number().integer(),
});
