export interface OtpProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}
