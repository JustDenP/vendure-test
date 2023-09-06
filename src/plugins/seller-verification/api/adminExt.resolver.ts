import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Logger, Permission, RequestContext, Transaction } from '@vendure/core';
import { Seller } from '@vendure/core/dist/entity/seller/seller.entity';

import { SellerVerifyService } from '../service/sellerverify.service';
import { SetSellerVerificationStatusInput } from '../types';

@Resolver()
export class AdminExtResolver {
  constructor(private sellerVerifyService: SellerVerifyService) {}

  @Transaction()
  @Mutation()
  @Allow(Permission.SuperAdmin)
  async setSellerVerificationStatus(
    @Ctx() ctx: RequestContext,
    @Args() args: { input: SetSellerVerificationStatusInput },
  ): Promise<Seller> {
    return this.sellerVerifyService.setSellerVerificationStatus(ctx, args.input);
  }
}

// @Resolver("Seller")
// export class VerifySellerResolver {
// 	constructor(private sellerVerifyService: SellerVerifyService) {}

// 	@ResolveField()
// 	@Allow(Permission.SuperAdmin)
// 	async isVerified(
// 		@Ctx() ctx: RequestContext,
// 		@Parent() seller: Seller
// 	): Promise<boolean> {
// 		return this.sellerVerifyService.isVerified(ctx, seller);
// 	}
// }
