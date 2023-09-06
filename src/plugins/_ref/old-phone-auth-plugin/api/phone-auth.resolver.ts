import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';

import { PhoneAuthService } from '../service/phone-auth.service';

@Resolver()
export class PhoneAuthResolver {
  constructor(private phoneAuthService: PhoneAuthService) {}

  @Mutation()
  requestOtp(@Ctx() ctx: RequestContext, @Args() args: { input: { phone: string; otp: string } }) {
    return this.phoneAuthService.requestOtp(ctx, args.input.phone, args.input.otp);
  }
}
