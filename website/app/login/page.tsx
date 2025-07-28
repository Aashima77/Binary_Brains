'use client';

import { useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button, Spinner } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

const LoginForm = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const [error, setError] = useState('');

  const onSubmit = async (data: FormData) => {
    setError('');

    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push('/feed');
      } else {
        const { message } = await res.json();
        setError(message);
      }
    } catch (error) {
      setError('Error, try again');
      console.log('Error during login: ', error);
    }
  };

  return (
    <div className="flex justify-center items-center px-3 h-screen font-inter">
      <div className="z-50 space-y-8 bg-white shadow-md p-8 rounded sm:w-96">
        <h2 className="font-grotesk font-bold text-black text-2xl text-center">
          Login to Your Account
        </h2>

        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="email"
            >
              Email
            </label>
            <input
              autoComplete="email"
              id="email"
              placeholder="Email address"
              type="email"
              {...register('email')}
              className="bg-gray-100 mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 w-full text-black sm:text-sm"
            />
            {errors.email && (
              <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label
              className="block font-medium text-gray-700 text-sm"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              id="password"
              placeholder="Password"
              type="password"
              {...register('password')}
              className="bg-gray-100 mt-1 mb-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-500 w-full text-black sm:text-sm"
            />
            {errors.password && (
              <p className="mt-1 text-red-500 text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-500 mt-2 px-3 py-1 rounded-md w-fit text-white text-sm">
              {error}
            </div>
          )}


          <div className="content-center grid">
            <Button color="success" disabled={isSubmitting} radius="full" type="submit" variant="solid" className="text-white">
              {isSubmitting ? <Spinner variant="simple" size="sm"/> : 'Sign In'}
            </Button>
          </div>
        </form>

        <div className="flex justify-center">
          <span className="text-slate-600 text-sm">
            Don't have an account?
            <Link
              className="ml-1 font-bold text-black text-sm hover:underline underline-offset-2"
              href="/signup"
            >
              Sign Up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;