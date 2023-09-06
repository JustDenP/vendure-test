import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

@Entity()
export class PhoneOtp extends VendureEntity {
  constructor(input?: DeepPartial<PhoneOtp>) {
    super(input);
  }

  @Column()
  phone: string;

  @Column()
  otp: string;

  @Column()
  verified: boolean;
}
