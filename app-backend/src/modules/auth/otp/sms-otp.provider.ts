import { OtpProvider } from './otp.provider';

export class SmsOtpProvider implements OtpProvider {
  async sendOtp(phone: string, code: string): Promise<void> {
    // TODO: integrate Twilio / Firebase / MSG91
    console.log(`[SMS MOCK] Sending OTP ${code} to ${phone}`);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
  }
}
