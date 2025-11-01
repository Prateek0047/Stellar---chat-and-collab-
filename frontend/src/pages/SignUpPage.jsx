import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { resendOTP, signup, verifyEmail } from "../lib/api.js";

const SignUpPage = () => {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("signup"); // 'signup' or 'verify'
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
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

  // Signup Mutation
  const {
    mutate: signupMutation,
    isPending: isSignupPending,
    error: signupError,
  } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("Signup success:", data);
      setStep("verify");
      setTimer(60);
      setCanResend(false);
    },
    onError: (error) => {
      console.error("Signup error:", error);
      console.error("Error response:", error.response?.data);
    },
  });

  // Verify Email Mutation
  const {
    mutate: verifyMutation,
    isPending: isVerifyPending,
    error: verifyError,
  } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      console.log("Verify success:", data);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      // User will be redirected by your auth logic
    },
    onError: (error) => {
      console.error("Verify error:", error);
      console.error("Error response:", error.response?.data);
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

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
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

    verifyMutation({ email: signupData.email, otp: otpString });
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    resendMutation({ email: signupData.email, type: "email_verification" });
  };

  const error = signupError || verifyError;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        {/* SIGNUP/VERIFY FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <MessageCircle className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Stellar
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>
                {error.response?.data?.message ||
                  error.message ||
                  "An error occurred"}
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
            {step === "signup" ? (
              // SIGNUP FORM
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Create an Account</h2>
                    <p className="text-sm opacity-70">
                      Join Stellar and start your language learning adventure!
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* FULLNAME */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="input input-bordered w-full"
                        value={signupData.fullName}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {/* EMAIL */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Email</span>
                      </label>
                      <input
                        type="email"
                        placeholder="john@gmail.com"
                        className="input input-bordered w-full"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    {/* PASSWORD */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Password</span>
                      </label>
                      <input
                        type="password"
                        placeholder="********"
                        className="input input-bordered w-full"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        required
                      />
                      <p className="text-xs opacity-70 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="form-control">
                      <label className="label cursor-pointer justify-start gap-2">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm"
                          required
                        />
                        <span className="text-xs leading-tight">
                          I agree to the{" "}
                          <span className="text-primary hover:underline">
                            terms of service
                          </span>{" "}
                          and{" "}
                          <span className="text-primary hover:underline">
                            privacy policy
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-full"
                    type="submit"
                    disabled={isSignupPending}
                  >
                    {isSignupPending ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                  <div className="divider">OR</div>
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href =
                        "http://localhost:5001/api/auth/google")
                    }
                    className="btn btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <FcGoogle className="size-5" />
                    Sign up with Google
                  </button>

                  <div className="text-center mt-4">
                    <p className="text-sm">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary hover:underline"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              // OTP VERIFICATION FORM
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-sm opacity-70">
                    We've sent a 6-digit code to <br />
                    <span className="font-medium">{signupData.email}</span>
                  </p>
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
                      "Verify Email"
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
                      setStep("signup");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    ← Back to Signup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IMAGE SECTION - RIGHT SIDE */}
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

export default SignUpPage;
