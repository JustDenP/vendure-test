import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';

import { PhoneAuthResolver } from './api/phone-auth.resolver';
import { PhoneOtp } from './entities/phoneOtp.entity';
import { PhoneAuthenticationStrategy } from './phone-auth.strategy';
import { PhoneAuthService } from './service/phone-auth.service';

const schemaExtension = gql`
  extend type Mutation {
    requestOtp(phone: String!): String!
  }
`;

export interface PhoneAuthPluginOptions {
  sendOtp?: (phone: string, otp: string) => Promise<any>;
  defaultUserDataBuilder: (phone: string) => {
    emailAddress: string;
    firstName: string;
    lastName: string;
  };
  otpGeneratorOptions?: {
    length?: number;
    upperCaseAlphabets?: boolean;
    specialChars?: boolean;
    digits?: boolean;
    lowerCaseAlphabets?: boolean;
  };
}

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [PhoneOtp],
  providers: [PhoneAuthService],
  shopApiExtensions: {
    schema: schemaExtension,
    resolvers: [PhoneAuthResolver],
  },
  configuration: (config) => {
    config.authOptions.shopAuthenticationStrategy.push(new PhoneAuthenticationStrategy());

    return config;
  },
})
export class PhoneAuthPlugin {
  static options: PhoneAuthPluginOptions;
  static init(options: PhoneAuthPluginOptions): typeof PhoneAuthPlugin {
    this.options = options;

    return PhoneAuthPlugin;
  }
}
