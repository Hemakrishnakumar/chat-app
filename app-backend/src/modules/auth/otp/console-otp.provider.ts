import { OtpProvider } from './otp.provider';

export class ConsoleOtpProvider implements OtpProvider {
  async sendOtp(phone: string, code: string): Promise<void> {
    console.log(`OTP for ${phone}: ${code}`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
  }
}
