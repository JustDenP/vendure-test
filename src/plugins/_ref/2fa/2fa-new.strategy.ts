import { Injectable } from '@nestjs/common';
import {
  AuthenticationStrategy,
  Injector,
  NativeAuthenticationStrategy,
  RequestContext,
  User,
  UserService,
} from '@vendure/core';
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export type TwoFaAuthData = {
  username: string;
  password: string;
  otp?: string;
};

@Injectable()
export class TwoFaAuthenticationStrategy implements AuthenticationStrategy<TwoFaAuthData> {
  name = 'native';
  private nativeAuth: NativeAuthenticationStrategy;
  private userService: UserService;

  constructor() {
    this.nativeAuth = new NativeAuthenticationStrategy();
  }

  init(injector: Injector) {
    this.userService = injector.get(UserService);
  }

  defineInputType(): DocumentNode {
    return gql`
      input TwoFaAuthData {
        username: String!
        password: String!
        otp: String
      }
    `;
  }

  async authenticate(ctx: RequestContext, data: TwoFaAuthData): Promise<User | false> {
    const user = await this.userService.getUserByEmailAddress(ctx, data.username);

    if (!user) {
      return false;
    }

    const passwordMatch = await this.nativeAuth.verifyUserPassword(ctx, user.id, data.password);

    if (!passwordMatch || data.otp !== '123') {
      return false;
    }

    return user;
  }
}
