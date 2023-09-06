import { cancelOrderButton, completeOrderButton } from '@pinelab/vendure-plugin-admin-ui-helpers';
import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';

import { SellerVerifyPlugin } from './plugins/seller-verification';

if (require.main === module) {
  // Called directly from command line
  customAdminUi({ recompile: true, devMode: false })
    .compile?.()
    .then(() => {
      process.exit(0);
    });
}

export function customAdminUi(options: { recompile: boolean; devMode: boolean }) {
  const compiledAppPath = path.join(__dirname, '__admin-ui');

  if (options.recompile) {
    return compileUiExtensions({
      outputPath: compiledAppPath,
      extensions: [
        SellerVerifyPlugin.uiExtensions,
        // ReviewsPlugin.uiExtensions,
        /**
         * Adds a 'Complete order' to the order detail overview.
         * This transitions the order to the `Delivered` state.
         */
        completeOrderButton,
        /**
         * Adds a 'Cancel order' to the order detail overview.
         * Cancels and refunds the order.
         */
        cancelOrderButton,
      ],
      devMode: options.devMode,
    });
  }

  return {
    path: path.join(compiledAppPath, 'dist'),
  };
}
