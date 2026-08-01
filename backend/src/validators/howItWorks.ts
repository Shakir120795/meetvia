import Joi from 'joi';

const stepSchema = Joi.object({
  stepNumber: Joi.number().integer().required().messages({
    'any.required': 'Step number is required',
  }),
  title: Joi.string().max(100).required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 100 characters',
  }),
  description: Joi.string().max(300).required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description is required',
    'string.max': 'Description must not exceed 300 characters',
  }),
});

export const updateHowItWorksSchema = Joi.object({
  steps: Joi.array().items(stepSchema).max(10).required().messages({
    'any.required': 'Steps are required',
    'array.max': 'Maximum of 10 steps allowed',
  }),
});
