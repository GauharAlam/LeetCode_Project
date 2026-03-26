import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../utils/axiosClient";
import Navbar from "../components/Navbar";

const EmailSchema = z.object({
  emailId: z.email("Invalid email address"),
});

const ResetSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: z.string().min(8, "Password should contain at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [emailId, setEmailId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({
    resolver: zodResolver(EmailSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm({
    resolver: zodResolver(ResetSchema),
  });

  const onEmailSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const response = await axiosClient.post("/user/forgot-password", { emailId: data.emailId });
      setEmailId(data.emailId);
      setSuccessMsg(response.data.message || "OTP Sent!");
      setStep(2);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to initiate reset");
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    
    try {
      const payload = {
        emailId,
        otp: data.otp,
        newPassword: data.newPassword
      };
      await axiosClient.post("/user/reset-password", payload);
      alert("Password has been reset successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        
        {step === 1 && (
          <form
            onSubmit={handleEmailSubmit(onEmailSubmit)}
            className="bg-white dark:bg-gray-800 dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col items-center gap-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center w-full">
              <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Reset Password</h2>
              <p className="text-gray-500 text-sm">Enter your email and we'll send a recovery code.</p>
            </div>

            {errorMsg && <div className="alert alert-error text-sm py-2 w-full">{errorMsg}</div>}

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="developer@example.com"
                className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-gray-300"
                {...registerEmail("emailId")}
              />
              {emailErrors.emailId && (
                <span className="text-gray-500 text-sm mt-1">{emailErrors.emailId.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn w-full bg-gray-900 hover:bg-black text-white border-none mt-2"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : "Send Reset Code"}
            </button>

            <Link to="/login" className="text-sm text-gray-700 dark:text-gray-400 font-medium hover:underline">
              Back to Login
            </Link>
          </form>
        )}

        {step === 2 && (
          <form
            onSubmit={handleResetSubmit(onResetSubmit)}
            className="bg-white dark:bg-gray-800 dark:bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-md flex flex-col items-center gap-5 border border-gray-200 dark:border-gray-700"
          >
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">Create New Password</h2>
              <p className="text-gray-500 text-sm">We sent a 6-digit code to <strong className="text-gray-900 dark:text-white">{emailId}</strong></p>
            </div>

            {successMsg && <div className="alert alert-success text-sm py-2 w-full">{successMsg}</div>}
            {errorMsg && <div className="alert alert-error text-sm py-2 w-full">{errorMsg}</div>}

            <div className="form-control w-full mt-2">
              <input
                type="text"
                placeholder="OTP Code"
                maxLength={6}
                className="input input-bordered w-full text-center text-3xl tracking-[0.5em] pl-[0.5em] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-gray-300 font-mono h-16"
                {...registerReset("otp")}
              />
              {resetErrors.otp && (
                <span className="text-gray-500 text-sm mt-1 text-center font-medium">{resetErrors.otp.message}</span>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300">New Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                  {...registerReset("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 dark:text-gray-400 hover:text-white focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
              {resetErrors.newPassword && (
                <span className="text-gray-500 text-sm mt-1">{resetErrors.newPassword.message}</span>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300">Confirm New Password</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                {...registerReset("confirmPassword")}
              />
              {resetErrors.confirmPassword && (
                <span className="text-gray-500 text-sm mt-1">{resetErrors.confirmPassword.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn w-full bg-gray-900 hover:bg-black text-white border-none mt-4 h-12"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : "Reset Password"}
            </button>

            <button
               type="button"
               className="text-sm bg-transparent border-none text-gray-700 dark:text-gray-400 hover:underline mt-2"
               onClick={() => setStep(1)}
            >
              Cancel
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default ForgotPassword;
