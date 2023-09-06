import { Injectable } from '@nestjs/common';
import {
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
export class TwoFaAuthenticationStrategy extends NativeAuthenticationStrategy {
  private _userService: UserService;

  constructor() {
    super();
  }

  async init(injector: Injector) {
    this._userService = injector.get(UserService);
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
    const user = await this._userService.getUserByEmailAddress(ctx, data.username);

    if (!user) {
      return false;
    }

    const passwordMatch = await this.verifyUserPassword(ctx, user.id, data.password);

    if (!passwordMatch || data.otp !== '123') {
      return false;
    }

    return user;
  }
}
