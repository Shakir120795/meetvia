import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRY: string;
  PORT: number;
  NODE_ENV: string;
  MAX_IMAGE_SIZE: number;
  MAX_VIDEO_SIZE: number;
}

function validateEnv(): EnvConfig {
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `Please check your .env file.`
    );
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid number between 1 and 65535');
  }

  const maxImageSize = parseInt(process.env.MAX_IMAGE_SIZE || '10', 10);
  const maxVideoSize = parseInt(process.env.MAX_VIDEO_SIZE || '100', 10);

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
    PORT: port,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MAX_IMAGE_SIZE: maxImageSize,
    MAX_VIDEO_SIZE: maxVideoSize,
  };
}

const env = validateEnv();

export default env;
