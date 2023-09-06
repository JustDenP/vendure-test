import {
  AuthenticationStrategy,
  CustomerService,
  ExternalAuthenticationService,
  Injector,
  Logger,
  RequestContext,
  User,
} from '@vendure/core';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

import { loggerCtx } from './constants';
import { PhoneAuthService } from './service/phone-auth.service';

export type PhoneAuthData = {
  phone: string;
  otp: string;
};

export class PhoneAuthenticationStrategy implements AuthenticationStrategy<PhoneAuthData> {
  readonly name = 'phone';
  private externalAuthenticationService: ExternalAuthenticationService;
  private phoneAuthService: PhoneAuthService;
  private customerService: CustomerService;

  constructor() {}

  init(injector: Injector) {
    this.externalAuthenticationService = injector.get(ExternalAuthenticationService);
    this.phoneAuthService = injector.get(PhoneAuthService);
    this.customerService = injector.get(CustomerService);
  }

  defineInputType(): DocumentNode {
    return gql`
      input PhoneAuthInput {
        phone: String!
        otp: String!
      }
    `;
  }

  async authenticate(ctx: RequestContext, data: PhoneAuthData): Promise<User | false | string> {
    const verified = await this.phoneAuthService.verifyOtp(ctx, data.phone, data.otp);

    if (!verified) {
      return 'Invalid OTP';
    }

    const user = await this.externalAuthenticationService.findCustomerUser(
      ctx,
      this.name,
      data.phone,
    );

    if (user) {
      return user;
    }

    const defaultUserData = this.phoneAuthService.getDefaultUserData(data.phone);

    if (defaultUserData.emailAddress.length === 0) {
      Logger.error('Valid default email address is required', loggerCtx);

      return 'Valid default email address is required';
    }

    try {
      const newCustomer = await this.externalAuthenticationService.createCustomerAndUser(ctx, {
        strategy: this.name,
        externalIdentifier: data.phone,
        verified: true,
        emailAddress: defaultUserData.emailAddress,
        firstName: defaultUserData.firstName,
        lastName: defaultUserData.lastName,
      });

      const customer = await this.customerService.findOneByUserId(ctx, newCustomer.id);
      if (!customer) return Promise.reject('Customer not found');

      await this.customerService.update(ctx, {
        id: customer.id,
        phoneNumber: data.phone,
        firstName: data.phone,
      });

      return newCustomer;
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
