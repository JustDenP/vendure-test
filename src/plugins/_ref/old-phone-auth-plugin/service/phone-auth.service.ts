import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Logger, RequestContext, TransactionalConnection } from '@vendure/core';
import otpGenerator from 'otp-generator';

import { loggerCtx } from '../constants';
import { PhoneOtp } from '../entities/phoneOtp.entity';
import { PhoneAuthPlugin } from '../phone-auth.plugin';

@Injectable()
export class PhoneAuthService implements OnApplicationBootstrap {
  constructor(private connection: TransactionalConnection) {}

  async onApplicationBootstrap() {
    if (!PhoneAuthPlugin.options?.sendOtp) {
      Logger.warn('sendOtp is not defined, please define it in the plugin options', loggerCtx);
    }
  }

  /**
   * @description Request OTP
   * @param ctx - RequestContext
   * @param phone - phone number
   * @param otp - otp
   * @returns string
   */
  async requestOtp(ctx: RequestContext, phone: string, otp: string) {
    const phoneOtp = new PhoneOtp();
    phoneOtp.phone = phone;

    // added config for otp generator
    if (
      PhoneAuthPlugin.options?.otpGeneratorOptions &&
      PhoneAuthPlugin.options?.otpGeneratorOptions.length
    ) {
      phoneOtp.otp = otpGenerator.generate(PhoneAuthPlugin.options?.otpGeneratorOptions.length, {
        upperCaseAlphabets:
          PhoneAuthPlugin.options?.otpGeneratorOptions.upperCaseAlphabets || false,
        specialChars: PhoneAuthPlugin.options?.otpGeneratorOptions.specialChars || false,
        digits: PhoneAuthPlugin.options?.otpGeneratorOptions.digits || true,
        lowerCaseAlphabets:
          PhoneAuthPlugin.options?.otpGeneratorOptions.lowerCaseAlphabets || false,
      });
    } else {
      phoneOtp.otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        digits: true,
        lowerCaseAlphabets: false,
      });
    }

    phoneOtp.verified = false;

    if (PhoneAuthPlugin.options?.sendOtp) {
      try {
        await PhoneAuthPlugin.options.sendOtp(phoneOtp.phone, phoneOtp.otp);
        await this.connection.getRepository(ctx, PhoneOtp).save(phoneOtp);

        return 'OTP sent successfully, please verify';
      } catch (error: any) {
        Logger.error(error, loggerCtx);
      }
    } else {
      await this.connection.getRepository(ctx, PhoneOtp).save(phoneOtp);

      return 'OTP sent successfully, please verify';
    }
  }

  /**
   * @description Verify OTP
   * @param ctx - RequestContext
   * @param phone - phone number
   * @param otp - otp
   * @returns boolean
   * */
  async verifyOtp(ctx: RequestContext, phone: string, otp: string) {
    const phoneOtp = new PhoneOtp();
    phoneOtp.phone = phone;
    phoneOtp.otp = otp;
    phoneOtp.verified = false;

    const phoneOtpData = await this.connection.getRepository(ctx, PhoneOtp).findOne(phoneOtp);

    if (phoneOtpData) {
      await this.connection
        .getRepository(ctx, PhoneOtp)
        .update(phoneOtpData.id, { verified: true });

      return true;
    }

    return false;
  }

  getDefaultUserData(phone: string) {
    return PhoneAuthPlugin.options.defaultUserDataBuilder(phone);
  }
}
