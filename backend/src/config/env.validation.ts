import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),
  DIRECT_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  JWT_ACCESS_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('30d'),

  PAYSTACK_SECRET_KEY: Joi.string().allow('').optional(),
  FLUTTERWAVE_SECRET_KEY: Joi.string().allow('').optional(),
  FLUTTERWAVE_WEBHOOK_SECRET_HASH: Joi.string().allow('').optional(),

  FCM_PROJECT_ID: Joi.string().allow('').optional(),
  FCM_CLIENT_EMAIL: Joi.string().allow('').optional(),
  FCM_PRIVATE_KEY: Joi.string().allow('').optional(),

  RESEND_API_KEY: Joi.string().allow('').optional(),

  CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
  CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
  CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),

  SIS_BASE_URL: Joi.string().allow('').optional(),
  SIS_API_KEY: Joi.string().allow('').optional(),
});
