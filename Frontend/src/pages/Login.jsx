import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { loginUser } from "../authSlice"; 

const LoginSchema = z.object({
    emailId: z.email("Invalid email address"),
    password: z.string().min(8, "Password should contain at least 8 characters"),
});

function Login() {
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
        dispatch(loginUser(data)); 
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
                    <input
                        type='password'
                        placeholder='••••••••'
                        className='input input-bordered w-full bg-gray-700 border-gray-600 text-white'
                        {...register('password')}
                    />
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
                        "Log In"
                    )}
                </button>

                {/* Added Navigation Link */}
                <div className="text-sm text-gray-400 mt-2">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 hover:underline">
                        Sign up
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default Login;