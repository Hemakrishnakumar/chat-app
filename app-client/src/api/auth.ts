import { api } from "./client";

export const sendOtp = async (phone: string) => {
  const res = await api.post("/auth/send-otp", { phone });
  return res.data;
};

export const verifyOtp = async (phone: string, code: string) => {
  const res = await api.post("/auth/verify-otp", { phone, otp: code });
  return res.data;
};