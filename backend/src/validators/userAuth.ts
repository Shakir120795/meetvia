import Joi from 'joi';

const email = Joi.string().email().max(254).optional();
const mobile = Joi.string().pattern(/^\+?[1-9]\d{7,14}$/).optional();

export const requestOtpSchema = Joi.object({
  email,
  mobile,
  purpose: Joi.string().valid('LOGIN', 'SIGNUP', 'VERIFY_EMAIL', 'VERIFY_MOBILE').default('LOGIN'),
}).custom((value, helpers) => {
  if (!value.email && !value.mobile) {
    return helpers.error('any.custom', { message: 'Email or mobile is required' });
  }
  if (value.email && value.mobile) {
    return helpers.error('any.custom', { message: 'Provide either email or mobile, not both' });
  }
  return value;
}).messages({
  'any.custom': '{{#message}}',
});

export const verifyOtpSchema = Joi.object({
  email,
  mobile,
  purpose: Joi.string().valid('LOGIN', 'SIGNUP', 'VERIFY_EMAIL', 'VERIFY_MOBILE').required(),
  code: Joi.string().pattern(/^\d{6}$/).required(),
}).custom((value, helpers) => {
  if (!value.email && !value.mobile) {
    return helpers.error('any.custom', { message: 'Email or mobile is required' });
  }
  if (value.email && value.mobile) {
    return helpers.error('any.custom', { message: 'Provide either email or mobile, not both' });
  }
  return value;
}).messages({
  'any.custom': '{{#message}}',
});
