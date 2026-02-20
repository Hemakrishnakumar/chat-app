import { IsPhoneNumber, IsString } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('IN')
  phone: string;

  @IsString()
  otp: string;
}
