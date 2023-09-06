import { LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import path from 'path';

import { AdminExtResolver } from './api/adminExt.resolver';
import { adminSchema } from './api/api-extensions';
import { SellerVerifyService } from './service/sellerverify.service';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [SellerVerifyService],
  adminApiExtensions: {
    resolvers: [AdminExtResolver],
    schema: adminSchema,
  },
  configuration: (config) => {
    config.customFields.Seller.push({
      name: 'isVerified',
      type: 'boolean',
      readonly: true,
      label: [
        {
          languageCode: LanguageCode.en,
          value: 'Seller Verification Status',
        },
      ],
    });

    return config;
  },
})
export class SellerVerifyPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'lazy',
        route: 'verify-seller',
        ngModuleFileName: 'verify-seller-ui-lazy.module.ts',
        ngModuleName: 'VerifySellerUIModule',
      },
      {
        type: 'shared',
        ngModuleFileName: 'verify-seller-ui-extension.module.ts',
        ngModuleName: 'VerifySellerExtensionModule',
      },
    ],
  };
}
