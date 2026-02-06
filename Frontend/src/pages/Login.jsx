import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react'; // Added useState
import { useDispatch, useSelector } from 'react-redux';
<<<<<<< Updated upstream
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { loginUser } from "../authSlice"; 
=======
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../authslice";
>>>>>>> Stashed changes

const LoginSchema = z.object({
    emailId: z.email("Invalid email address"),
    password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
    const [showPassword, setShowPassword] = useState(false); // Added State
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(LoginSchema)
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const submittedData = (data) => {
<<<<<<< Updated upstream
        dispatch(loginUser(data)); 
=======
        dispatch(loginUser(data));
>>>>>>> Stashed changes
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <form
                onSubmit={handleSubmit(submittedData)}
                className='bg-gray-800 p-8 rounded-lg shadow-xl w-96 flex flex-col items-center gap-6'
            >
                <h2 className="text-3xl font-bold text-white">Leetcode</h2>

                {/* Show Error Message if login fails */}
                {error && <div className="alert alert-error text-sm py-2">{typeof error === 'string' ? error : 'Login failed'}</div>}

                <div className="w-full">
                    <label className="text-gray-400">Email</label>
                    <input
                        type="email"
                        placeholder='nawaz@example.com'
                        className='input input-bordered w-full bg-gray-700 border-gray-600 text-white'
                        {...register('emailId')}
                    />
                    {errors.emailId && <span className="text-red-400 text-sm">{errors.emailId.message}</span>}
                </div>

                <div className="w-full">
                    <label className="text-gray-400">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder='••••••••'
                            className='input input-bordered w-full bg-gray-700 border-gray-600 text-white pr-10' // Added pr-10
                            {...register('password')}
                        />
                        {/* Eye Icon Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white focus:outline-none"
                        >
                            {showPassword ? (
                                // Eye Off Icon
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                // Eye Icon
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {errors.password && <span className="text-red-400 text-sm">{errors.password.message}</span>}
                </div>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading loading-spinner"></span>
                    ) : (
<<<<<<< Updated upstream
                        "Log In"
                    )}
                </button>

                {/* Added Navigation Link */}
                <div className="text-sm text-gray-400 mt-2">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 hover:underline">
                        Sign up
=======
                        "Login"
                    )}
                </button>

                <div className="text-sm text-gray-400 mt-1">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-purple-400 hover:underline hover:text-purple-300">
                        Sign Up
>>>>>>> Stashed changes
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;