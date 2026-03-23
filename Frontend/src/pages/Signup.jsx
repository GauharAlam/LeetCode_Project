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
              className="input input-bordered w-full text-center text-3xl tracking-[1em] pl-[1em] bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-gray-300 font-mono h-16"
              {...registerOtp("otp")}
            />
            {otpErrors.otp && (
              <span className="text-gray-500 mt-2 text-center text-sm font-medium">
                {otpErrors.otp.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn w-full mt-2 bg-gray-900 hover:bg-black border-none text-white text-lg h-12"
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
              className="text-gray-700 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-400 font-semibold hover:underline border-none bg-transparent"
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
            <span className="text-gray-500 text-sm mt-1">
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
            <span className="text-gray-500 text-sm mt-1">
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
                <span className="text-gray-500 text-sm mt-1">
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
                <span className="text-gray-500 text-sm mt-1">
                  {signupErrors.confirmPassword.message}
                </span>
              )}
            </div>

            <button
          type="submit"
          className="btn w-full mt-4 bg-gray-900 hover:bg-black border-none text-white text-lg h-12"
          disabled={loading}
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Sign Up"
          )}
        </button>

        <div className="flex flex-col w-full gap-3">
          <div className="flex items-center gap-2 w-full">
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
            <span className="text-xs text-gray-500 uppercase">Or continue with</span>
            <hr className="flex-1 border-gray-300 dark:border-gray-600" />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com'}/user/auth/google`}
              className="btn flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL || 'https://algoforge-30zk.onrender.com'}/user/auth/github`}
              className="btn flex-1 bg-gray-900 hover:bg-black border-none text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-700 dark:text-gray-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;