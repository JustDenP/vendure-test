import 'dotenv/config';

import { dummyPaymentHandler, VendureConfig } from '@vendure/core';
import fs from 'fs';
import path from 'path';

// import { TwoFaAuthenticationStrategy } from './plugins/authentication/2fa/2fa-new.strategy';
import { plugins } from './vendure-plugins';

const IS_DEV = process.env.APP_ENV === 'dev';

export const config: VendureConfig = {
  apiOptions: {
    port: 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
      ? {
          cors: {
            origin: [
              'http://localhost:3000',
              'http://localhost:3001',
              'http://localhost:4200',
              'http://localhost:5173',
            ],
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
          },
          adminApiPlayground: {
            settings: { 'request.credentials': 'include' } as any,
          },
          adminApiDebug: true,
          shopApiPlayground: {
            settings: { 'request.credentials': 'include' } as any,
          },
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
    },
    // adminAuthenticationStrategy: [new TwoFaAuthenticationStrategy()],
  },
  dbConnectionOptions: {
    type: 'postgres',
    // See the README.md "Migrations" section for an explanation of
    // the `synchronize` and `migrations` options.
    synchronize: true,
    migrations: [getMigrationsPath()],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},
  plugins,
};

function getMigrationsPath() {
  const devMigrationsPath = path.join(__dirname, '../migrations');
  const distMigrationsPath = path.join(__dirname, 'migrations');

  return fs.existsSync(distMigrationsPath)
    ? path.join(distMigrationsPath, '*.js')
    : path.join(devMigrationsPath, '*.ts');
}
