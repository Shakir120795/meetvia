import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  reviewerName: Joi.string().max(100).required().messages({
    'any.required': 'Reviewer name is required',
    'string.empty': 'Reviewer name is required',
    'string.max': 'Reviewer name must not exceed 100 characters',
  }),
  location: Joi.string().max(100).allow('', null).messages({
    'string.max': 'Location must not exceed 100 characters',
  }),
  reviewText: Joi.string().max(500).required().messages({
    'any.required': 'Review text is required',
    'string.empty': 'Review text is required',
    'string.max': 'Review text must not exceed 500 characters',
  }),
  rating: Joi.number().integer().min(1).max(5).messages({
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
  }),
  image: Joi.string().allow('', null),
  isVerified: Joi.boolean(),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});

export const updateTestimonialSchema = Joi.object({
  reviewerName: Joi.string().max(100).messages({
    'string.max': 'Reviewer name must not exceed 100 characters',
  }),
  location: Joi.string().max(100).allow('', null).messages({
    'string.max': 'Location must not exceed 100 characters',
  }),
  reviewText: Joi.string().max(500).messages({
    'string.max': 'Review text must not exceed 500 characters',
  }),
  rating: Joi.number().integer().min(1).max(5).messages({
    'number.min': 'Rating must be between 1 and 5',
    'number.max': 'Rating must be between 1 and 5',
  }),
  image: Joi.string().allow('', null),
  isVerified: Joi.boolean(),
  isVisible: Joi.boolean(),
  displayOrder: Joi.number().integer(),
});
