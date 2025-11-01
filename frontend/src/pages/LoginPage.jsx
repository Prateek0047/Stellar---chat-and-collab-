import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { login, resendOTP, verifyDeviceOTP } from "../lib/api.js";
import {
  generateDeviceFingerprint,
  getDeviceInfo,
} from "../lib/deviceFingerprint.js";

const LoginPage = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("login"); // 'login' or 'verify'
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [rememberDevice, setRememberDevice] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");
  const [deviceInfo, setDeviceInfo] = useState({});
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Timer for resend OTP
  useEffect(() => {
    if (step === "verify" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, step]);

  // Login Mutation
  const {
    mutate: loginMutation,
    isPending: isLoginPending,
    error: loginError,
  } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login success:", data);
      if (data.requiresDeviceVerification) {
        // Need OTP verification
        setStep("verify");
        setTimer(60);
        setCanResend(false);
      } else if (data.requiresEmailVerification) {
        // Email not verified - show error
        // This is handled by the error response
      } else {
        // Successful login
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
    },
  });

  // Verify Device OTP Mutation
  const {
    mutate: verifyMutation,
    isPending: isVerifyPending,
    error: verifyError,
  } = useMutation({
    mutationFn: verifyDeviceOTP,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // User will be redirected by your auth logic
    },
  });

  // Resend OTP Mutation
  const {
    mutate: resendMutation,
    isPending: isResendPending,
    isSuccess: resendSuccess,
  } = useMutation({
    mutationFn: resendOTP,
    onSuccess: () => {
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    const fingerprint = generateDeviceFingerprint();
    const info = getDeviceInfo();

    setDeviceFingerprint(fingerprint);
    setDeviceInfo(info);

    loginMutation({
      ...loginData,
      deviceFingerprint: fingerprint,
      rememberDevice,
    });
  };

  const handleOtpChange = (index, value) => {
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

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    const lastInput = document.getElementById(`otp-${lastIndex}`);
    if (lastInput) lastInput.focus();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) return;

    verifyMutation({
      email: loginData.email,
      otp: otpString,
      deviceFingerprint,
      deviceInfo,
      rememberDevice,
    });
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    resendMutation({ email: loginData.email, type: "device_verification" });
  };

  const error = loginError || verifyError;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* LOGIN/VERIFY FORM SECTION */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <MessageCircle className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              Stellar
            </span>
          </div>

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>
                {error.response?.data?.message || "An error occurred"}
              </span>
            </div>
          )}

          {/* SUCCESS MESSAGE FOR RESEND */}
          {resendSuccess && (
            <div className="alert alert-success mb-4">
              <span>OTP sent successfully!</span>
            </div>
          )}

          <div className="w-full">
            {step === "login" ? (
              // LOGIN FORM
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Welcome Back</h2>
                    <p className="text-sm opacity-70">
                      Sign in to your account to continue your language journey
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="form-control w-full space-y-2">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="hello@example.com"
                        className="input input-bordered w-full"
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="form-control w-full space-y-2">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="input input-bordered w-full"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    {/* Remember Device Checkbox */}
                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          checked={rememberDevice}
                          onChange={(e) => setRememberDevice(e.target.checked)}
                        />
                        <span className="text-sm">Remember this device</span>
                      </label>
                      <p className="text-xs opacity-60 ml-6">
                        You won't need to verify this device again
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={isLoginPending}
                    >
                      {isLoginPending ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </button>

                    <div className="divider">OR</div>
                    <button
                      type="button"
                      onClick={() =>
                        (window.location.href = "/api/auth/google")
                      }
                      className="btn btn-outline w-full flex items-center justify-center gap-2"
                    >
                      <FcGoogle className="size-5" />
                      Continue with Google
                    </button>

                    <div className="text-center mt-4">
                      <p className="text-sm">
                        Don't have an account?{" "}
                        <Link
                          to="/signup"
                          className="text-primary hover:underline"
                        >
                          Create one
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              // OTP VERIFICATION FORM
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Device Verification
                  </h2>
                  <p className="text-sm opacity-70">
                    We've sent a security code to <br />
                    <span className="font-medium">{loginData.email}</span>
                  </p>
                  <div className="alert alert-info mt-4">
                    <span className="text-xs">
                      🔐 This device is not recognized. Please verify it's you.
                    </span>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp}>
                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="input input-bordered w-12 h-12 text-center text-xl font-bold"
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full mb-4"
                    disabled={isVerifyPending || otp.join("").length !== 6}
                  >
                    {isVerifyPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Verifying...
                      </>
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-sm opacity-70 mb-2">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={handleResendOtp}
                    disabled={!canResend || isResendPending}
                    className={`text-sm font-medium ${
                      canResend
                        ? "text-primary hover:underline cursor-pointer"
                        : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {isResendPending
                      ? "Sending..."
                      : canResend
                      ? "Resend OTP"
                      : `Resend in ${timer}s`}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={() => {
                      setStep("login");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img
                src="/i.png"
                alt="Language connection illustration"
                className="w-full h-full"
              />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">
                Connect with language partners worldwide
              </h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language
                skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
