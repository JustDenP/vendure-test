import { OnModuleInit } from '@nestjs/common';
import {
  EventBus,
  LanguageCode,
  PluginCommonModule,
  ProductEvent,
  ProductVariant,
  ProductVariantEvent,
  ProductVariantPrice,
  ProductVariantService,
  TransactionalConnection,
  VendurePlugin,
} from '@vendure/core';
import { filter } from 'rxjs/operators';
import { In } from 'typeorm';

type ProductEventWithCustomFields = ProductEvent & {
  product: {
    customFields: {
      blkvar_price: number;
      blkvar_enable: boolean;
    };
  };
};

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [],
  configuration: (config) => {
    config.customFields.Product.push(
      {
        name: 'blkvar_price',
        type: 'int',
        public: true,
        nullable: true,
        label: [
          {
            languageCode: LanguageCode.en,
            value: 'Price',
          },
        ],
        ui: { tab: 'Bulk update', component: 'currency-form-input' },
      },
      {
        name: 'blkvar_enable',
        type: 'boolean',
        public: true,
        nullable: true,
        label: [
          {
            languageCode: LanguageCode.en,
            value: 'Enabled',
          },
        ],
        description: [
          {
            languageCode: LanguageCode.en,
            value:
              'Setting this field will update the variant prices everytime you update the product',
          },
        ],
        ui: { tab: 'Bulk update', component: 'boolean-form-input' },
      },
    );

    return config;
  },
  compatibility: '^2.0.0',
})
export class VariantBulkUpdatePlugin implements OnModuleInit {
  constructor(
    private eventBus: EventBus,
    private variantService: ProductVariantService,
    private connection: TransactionalConnection,
  ) {}

  async onModuleInit(): Promise<void> {
    this.eventBus
      .ofType(ProductEvent)
      .pipe(filter((event) => event.type === 'updated' || event.type === 'created'))
      .subscribe(async (event) => {
        const { product, ctx } = event as ProductEventWithCustomFields;

        if (product.customFields?.blkvar_price && product.customFields?.blkvar_enable === true) {
          const variants = await this.connection
            .getRepository(ctx, ProductVariant)
            .createQueryBuilder('variant')
            .select(['variant.id'])
            .where('variant.productId = :productId', { productId: product.id })
            .getMany();
          const variantIds = variants.map((v) => v.id);
          const res = await this.connection
            .getRepository(ctx, ProductVariantPrice)
            .createQueryBuilder('price')
            .update({
              price: product.customFields.blkvar_price,
            })
            .where({
              variant: In(variantIds),
              channelId: ctx.channelId,
            })
            .execute();

          this.eventBus.publish(new ProductVariantEvent(ctx, variants, 'updated'));
        }
      });
  }
}
