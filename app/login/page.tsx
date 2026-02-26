'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { login } from './actions';

function LoginForm() {
    const searchParams = useSearchParams();
    const errorMessage = searchParams.get('message');
    const [isLoading, setIsLoading] = useState(false);

    const handleFormAction = async (formData: FormData) => {
        setIsLoading(true);
        try {
            await login(formData);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-sm xl:max-w-md">
            <div className="mb-10 flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-35 w-35 items-center justify-center rounded-full bg-blue-100 border-4 border-white shadow-xl ring-1 ring-blue-50 text-blue-800 font-black text-2xl overflow-hidden mx-auto">
                    <img
                        src="./qnhs_logo.png"
                        alt="School Logo"
                        className="h-full w-full object-contain"
                    />

                </div>


                <h2 className="text-3xl font-bold tracking-tight text-blue-950">Welcome back</h2>
                <p className="mt-2 text-sm text-slate-500">
                    Please enter your credentials to access your account.
                </p>
            </div>

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600 animate-in fade-in slide-in-from-top-2">
                    {errorMessage}
                </div>
            )}

            <form action={handleFormAction} className="space-y-6">
                <div className="space-y-1">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Email address
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M3 4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H3zm14 2v1.4l-7 4.2-7-4.2V6h14zM3 9.4L10 13.6L17 9.4V14H3V9.4z" />
                            </svg>
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="admin@qnhs.edu.ph"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700"
                        >
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm3 7V7a3 3 0 10-6 0v2h6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm placeholder-slate-400 shadow-sm transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                        Remember me for 30 days
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full justify-center overflow-hidden rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70"
                    >
                        {/* Yellow highlight effect on hover */}
                        <span className="absolute inset-0 z-0 h-full w-0 bg-yellow-400 transition-all duration-300 ease-out group-hover:w-full"></span>
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-blue-950">
                            {isLoading ? (
                                <>
                                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                "Sign in to Portal"
                            )}
                        </span>
                    </button>
                </div>
            </form>

            <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-slate-50 px-3 text-slate-500">Need help?</span>
                </div>
            </div>

            <div className="mt-6 text-center text-sm">
                <p className="text-slate-600">
                    Contact your system administrator at{' '}
                    <a href="mailto:it@qnhs.edu.ph" className="font-semibold text-blue-600 hover:text-blue-800">
                        it@qnhs.edu.ph
                    </a>
                    {' '}for access issues.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <main className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Left Panel - Branding/Visual */}
            <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 text-white lg:flex xl:w-7/12">
                {/* Background Image with Blue Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('./login_bg.jpg')" }}
                ></div>
                <div className="absolute inset-0 z-0 bg-blue-900/80 mix-blend-multiply"></div>

                {/* Decorative Gradients */}
                <div className="absolute -left-20 -top-20 z-0 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"></div>
                <div className="absolute right-0 top-1/2 z-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-yellow-400/20 mix-blend-multiply blur-3xl"></div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="h-1 bg-yellow-400 w-12 rounded-full"></div>
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">Institutional Portal</span>
                </div>

                <div className="relative z-10 max-w-xl text-center lg:text-left">
                    <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-5xl">
                        Our Vision for <span className="text-yellow-400">Excellence</span> in Education.
                    </h2>
                    <div className="space-y-6 text-lg text-blue-100/90 leading-relaxed italic">
                        <p>
                            "To be the premier secondary educational institution, developing holistic individuals who are God-loving, patriotic, and globally competitive."
                        </p>
                        <p className="not-italic text-base text-blue-200/80">
                            Equipping citizens with values and competencies that enable them to realize their full potential and contribute meaningfully to building the nation.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 flex items-center justify-between border-t border-blue-800/50 pt-8 text-sm text-blue-200">
                    <p>&copy; {new Date().getFullYear()} Quezon National High School</p>
                    <div className="flex gap-4">
                        <Link href="#" className="hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-blue-900">Privacy Policy</Link>
                        <Link href="#" className="hover:text-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-blue-900">Terms of Service</Link>
                    </div>
                </div>
            </section>

            {/* Right Panel - Login Form */}
            <section className="flex w-full flex-col justify-center px-8 lg:w-1/2 xl:w-5/12 sm:px-16 md:px-24">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="mb-8 flex items-center gap-3 lg:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900 font-bold text-yellow-400 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                            <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 19.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75ZM6.166 18.894a.75.75 0 0 1-1.06-1.06l1.59-1.591a.75.75 0 1 1 1.061 1.06l-1.59 1.591ZM2.25 12a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75ZM6.166 5.106a.75.75 0 0 1 1.06 1.06L5.636 7.757a.75.75 0 1 1-1.06-1.061l1.59-1.59Z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold text-blue-900">QNHS Portal</h1>
                </div>

                <Suspense fallback={<div>Loading...</div>}>
                    <LoginForm />
                </Suspense>
            </section>
        </main>
    );
}
