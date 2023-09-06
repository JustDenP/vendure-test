import 'dotenv/config';

import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DefaultJobQueuePlugin, DefaultSearchPlugin, VendureConfig } from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin } from '@vendure/email-plugin';
import path from 'path';

import { customAdminUi } from './compile-admin-ui';
import { LimitVariantPerOrderPlugin } from './plugins/limit-product-per-order/limit-variant-per-order.plugin';
import { MultivendorPlugin } from './plugins/multivendor/multivendor.plugin';
import { ReviewsPlugin } from './plugins/reviews/reviews-plugin';
import { SellerVerifyPlugin } from './plugins/seller-verification';
import { ShippingByWeightAndCountryPlugin } from './plugins/shipping-by-weight-and-country';
import { VariantBulkUpdatePlugin } from './plugins/variations-price-bulk-edit/variant-bulk-update.plugin';

const IS_DEV = process.env.APP_ENV === 'dev';

export const plugins: VendureConfig['plugins'] = [
  AssetServerPlugin.init({
    // AssetServerPlugin.init({
    //   route: "assets",
    //   assetUploadDir: path.join(__dirname, "assets"),
    //   namingStrategy: new DefaultAssetNamingStrategy(),
    //   assetUrlPrefix: process.env.GCP_URL + "/catarina-vendure/assets/",
    //   storageStrategyFactory: configureS3AssetStorage({
    //     bucket: process.env.GCP_BUCKET || "",
    //     credentials: {
    //       accessKeyId: process.env.GCP_ACCESS_KEY_ID || "",
    //       secretAccessKey: process.env.GCP_ACCESS_SECRET_KEY || "",
    //     },
    //     nativeS3Configuration: {
    //       endpoint: process.env.GCP_URL,
    //       region: process.env.GCP_REGION,
    //       forcePathStyle: true,
    //       signatureVersion: "v4",
    //     },
    //   }),
    // }),
    route: 'assets',
    assetUploadDir: path.join(__dirname, '../static/assets'),
    // For local dev, the correct value for assetUrlPrefix should
    // be guessed correctly, but for production it will usually need
    // to be set manually to match your production url.
    assetUrlPrefix: IS_DEV ? undefined : 'https://www.my-shop.com/assets',
  }),
  DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
  DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
  EmailPlugin.init({
    devMode: true,
    outputPath: path.join(__dirname, '../static/email/test-emails'),
    route: 'mailbox',
    handlers: defaultEmailHandlers,
    templatePath: path.join(__dirname, '../static/email/templates'),
    globalTemplateVars: {
      // The following variables will change depending on your storefront implementation.
      // Here we are assuming a storefront running at http://localhost:8080.
      fromAddress: '"example" <noreply@example.com>',
      verifyEmailAddressUrl: 'http://localhost:8080/verify',
      passwordResetUrl: 'http://localhost:8080/password-reset',
      changeEmailAddressUrl: 'http://localhost:8080/verify-email-address-change',
    },
  }),
  VariantBulkUpdatePlugin,
  LimitVariantPerOrderPlugin,
  SellerVerifyPlugin,
  // ReviewsPlugin,
  ShippingByWeightAndCountryPlugin.init({
    /**
     * Weight unit used in the eligibility checker
     * and product customfield.
     * Only used for displaying purposes
     */
    weightUnit: 'kg',
    /**
     * The name of the tab the customfield should be added to
     * This can be an existing tab
     */
    customFieldsTab: 'Physical properties',
  }),
  MultivendorPlugin.init({
    platformFeePercent: 10,
    platformFeeSKU: 'FEE',
  }),
  AdminUiPlugin.init({
    route: 'admin',
    port: 3002,
    adminUiConfig: {
      apiHost: 'http://localhost',
      apiPort: 3000,
    },
    app: customAdminUi({ recompile: false, devMode: false }),
  }),
];
