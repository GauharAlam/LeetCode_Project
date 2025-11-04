import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router";
import { registerUser } from '../authSlice';

const SignupSchema = z.object({
    firstName: z.string().min(3, "Name should contain at least 3 characters"),
    emailId: z.email("Invalid email address"),
    password: z.string().min(8, "Password should contain at least 8 characters")
});

function Signup() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(SignupSchema)
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const submittedData = (data) => {
        dispatch(registerUser(data));
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                <form
                    onSubmit={handleSubmit(submittedData)}
                    className='bg-gray-800 p-8 rounded-lg shadow-xl w-96 flex flex-col items-center gap-6'
                >
                    <h2 className="text-3xl font-bold mb-6 text-white">Leetcode</h2>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text text-gray-400">First Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder='Nawaz'
                            className='input input-bordered w-full bg-gray-700 border-gray-600 text-white'
                            {...register('firstName')}
                        />
                        {errors.firstName && (<span className="text-red-400 text-sm mt-1">{errors.firstName.message}</span>)}
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text text-gray-400">Email</span>
                        </label>
                        <input
                            type="email"
                            placeholder='nawaz@example.com'
                            className='input input-bordered w-full bg-gray-700 border-gray-600 text-white'
                            {...register('emailId')}
                        />
                        {errors.emailId && (<span className="text-red-400 text-sm mt-1">{errors.emailId.message}</span>)}
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text text-gray-400">Password</span>
                        </label>
                        <input
                            type='password'
                            placeholder='••••••••'
                            className='input input-bordered w-full bg-gray-700 border-gray-600 text-white'
                            {...register('password')}
                        />
                        {errors.password && (<span className="text-red-400 text-sm mt-1">{errors.password.message}</span>)}
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary w-full mt-4 bg-purple-600 hover:bg-purple-700 border-none text-white'
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </>
    );
}

export default Signup;
