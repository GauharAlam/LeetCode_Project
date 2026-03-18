import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, verifyOtp } from "../authSlice";
import axiosClient from "../utils/axiosClient";

const SignupSchema = z.object({
  firstName: z.string().min(3, "Name should contain at least 3 characters"),
  emailId: z.email("Invalid email address"),
  password: z.string().min(8, "Password should contain at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const OtpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 characters")
});

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, requiresOtp, pendingEmail } = useSelector(
    (state) => state.auth
  );

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm({
    resolver: zodResolver(SignupSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm({
    resolver: zodResolver(OtpSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const submittedData = (data) => {
    dispatch(registerUser(data));
  };

  const submittedOtp = (data) => {
    dispatch(verifyOtp({ emailId: pendingEmail, otp: data.otp }));
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await axiosClient.post('/user/resend-otp', { emailId: pendingEmail });
      setResendMessage("A new OTP has been sent to your email!");
    } catch (err) {
      setResendMessage(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (requiresOtp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-white p-4">
        <form
          onSubmit={handleOtpSubmit(submittedOtp)}
          className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center gap-6"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Verify Email</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">We sent a 6-digit code to <strong className="text-gray-900 dark:text-white">{pendingEmail}</strong></p>
          </div>

          {error && <div className="alert alert-error text-sm py-2 w-full">{typeof error === 'string' ? error : 'Verification failed'}</div>}
          {resendMessage && <div className={`alert text-sm py-2 w-full ${resendMessage.includes('Failed') ? 'alert-error' : 'alert-success'}`}>{resendMessage}</div>}

          <div className="form-control w-full mt-2">
            <input
              type="text"
              placeholder="000000"
              maxLength={6}
              className="input input-bordered w-full text-center text-3xl tracking-[1em] pl-[1em] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-purple-500 font-mono h-16"
              {...registerOtp("otp")}
            />
            {otpErrors.otp && (
              <span className="text-red-500 mt-2 text-center text-sm font-medium">
                {otpErrors.otp.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn w-full mt-2 bg-purple-600 hover:bg-purple-700 border-none text-white text-lg h-12"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Verify & Login"}
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 flex flex-col items-center gap-2">
            <span>Didn't receive the code?</span>
            <button 
              type="button" 
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold hover:underline border-none bg-transparent"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-white p-4">
      <form
        onSubmit={handleSignupSubmit(submittedData)}
        className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-sm flex flex-col items-center gap-6"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">AlgoForge</h2>

        {error && <div className="alert alert-error text-sm py-2 w-full">{typeof error === 'string' ? error : 'Signup failed'}</div>}

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-600 dark:text-gray-400">First Name</span>
          </label>
          <input
            type="text"
            placeholder="Nawaz"
            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            {...registerSignup("firstName")}
          />
          {signupErrors.firstName && (
            <span className="text-red-500 text-sm mt-1">
              {signupErrors.firstName.message}
            </span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-600 dark:text-gray-400">Email</span>
          </label>
          <input
            type="email"
            placeholder="nawaz@example.com"
            className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            {...registerSignup("emailId")}
          />
          {signupErrors.emailId && (
            <span className="text-red-500 text-sm mt-1">
              {signupErrors.emailId.message}
            </span>
          )}
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text text-gray-600 dark:text-gray-400">Password</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
              {...registerSignup("password")}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
              {signupErrors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {signupErrors.password.message}
                </span>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-gray-600 dark:text-gray-400">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input input-bordered w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white pr-10"
                  {...registerSignup("confirmPassword")}
                />
              </div>
              {signupErrors.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {signupErrors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
          type="submit"
          className="btn w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white text-lg h-12"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Sign Up"
          )}
        </button>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;