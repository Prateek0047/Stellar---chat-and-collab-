import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});

// Auth endpoints
export const signup = async (userData) => {
  try {
    const res = await axiosInstance.post("/auth/signup", userData);
    console.log("Signup API response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Signup API error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmail = async ({ email, otp }) => {
  try {
    const res = await axiosInstance.post("/auth/verify-email", { email, otp });
    console.log("Verify email API response:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Verify email API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const res = await axiosInstance.post("/auth/login", credentials);
    console.log("Login API response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyDeviceOTP = async ({
  email,
  otp,
  deviceFingerprint,
  deviceInfo,
  rememberDevice,
}) => {
  try {
    const res = await axiosInstance.post("/auth/verify-device", {
      email,
      otp,
      deviceFingerprint,
      deviceInfo,
      rememberDevice,
    });
    console.log("Verify device API response:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Verify device API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const resendOTP = async ({ email, type }) => {
  try {
    const res = await axiosInstance.post("/auth/resend-otp", { email, type });
    console.log("Resend OTP API response:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "Resend OTP API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const logout = async () => {
  const res = await axiosInstance.post("/auth/logout");
  return res.data;
};

export const getAuthUser = async () => {
  const res = await axiosInstance.get("/auth/me");
  return res.data;
};

export const onboard = async (data) => {
  const res = await axiosInstance.post("/auth/onboarding", data);
  return res.data;
};

// User endpoints (existing code - keep as is)
// Add your existing user-related API functions here
