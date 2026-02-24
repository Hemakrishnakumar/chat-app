import { useState } from "react";
import { sendOtp, verifyOtp } from "../api/auth";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router";

export default function Login() {
  const { user, setUser, setToken } = useAuthContext()
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const handleSendOtp = async () => {
    await sendOtp(phone);
    setStep("otp");
  };

  const handleVerify = async () => {
    const data = await verifyOtp(phone, code);
    const { user, accessToken, refreshToken } = data;
    setUser({ userId: user.id, name: user.name, profilePhotoUrl: user.profilePhotoUrl});
    localStorage.setItem("accessToken", data.accessToken);
    setToken(accessToken)
    localStorage.setItem("refreshToken", refreshToken);    
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>

      {step === "phone" && (
        <>
          <input
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={handleSendOtp}>Send OTP</button>
        </>
      )}

      {step === "otp" && (
        <>
          <input
            placeholder="OTP"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={handleVerify}>Verify</button>
        </>
      )}
    </div>
  );
}