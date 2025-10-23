import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, MessageCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  resendOTP,
  verifyDeviceOTP,
  verifyEmail,
} from "../../../backend/src/lib/api.js";

const OTPVerificationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    email,
    type = "email",
    deviceFingerprint,
    deviceInfo,
    rememberDevice,
  } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      console.log("No email provided, redirecting to signup");
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  // Timer for resend OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Verify Email OTP Mutation
  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/onboarding");
    },
  });

  // Verify Device OTP Mutation
  const verifyDeviceMutation = useMutation({
    mutationFn: verifyDeviceOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
  });

  // Resend OTP Mutation
  const resendMutation = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    },
  });

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      return;
    }

    if (type === "email") {
      verifyEmailMutation.mutate({ email, otp: otpString });
    } else {
      verifyDeviceMutation.mutate({
        email,
        otp: otpString,
        deviceFingerprint,
        deviceInfo,
        rememberDevice,
      });
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    resendMutation.mutate({
      email,
      type: type === "email" ? "email_verification" : "device_verification",
    });
  };

  const error =
    verifyEmailMutation.error ||
    verifyDeviceMutation.error ||
    resendMutation.error;
  const isPending =
    verifyEmailMutation.isPending || verifyDeviceMutation.isPending;

  // Don't render if no email (will redirect)
  if (!email) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      data-theme="forest"
    >
      <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <MessageCircle className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Stellar
            </span>
          </div>

          {/* Icon based on type */}
          <div className="flex justify-center mb-4">
            {type === "email" ? (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-primary" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              {type === "email" ? "Verify Your Email" : "Device Verification"}
            </h2>
            <p className="text-sm opacity-70">
              {type === "email"
                ? `We've sent a 6-digit code to ${email}`
                : `We've sent a security code to ${email} to verify this device`}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>
                {error.response?.data?.message || "An error occurred"}
              </span>
            </div>
          )}

          {/* Success Message for Resend */}
          {resendMutation.isSuccess && (
            <div className="alert alert-success mb-4">
              <span>OTP sent successfully!</span>
            </div>
          )}

          {/* OTP Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="input input-bordered w-12 h-12 text-center text-xl font-bold"
                  required
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              disabled={isPending || otp.join("").length !== 6}
            >
              {isPending ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-sm opacity-70 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={!canResend || resendMutation.isPending}
              className={`text-sm font-medium ${
                canResend
                  ? "text-primary hover:underline cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {resendMutation.isPending
                ? "Sending..."
                : canResend
                ? "Resend OTP"
                : `Resend in ${timer}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;
