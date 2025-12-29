'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error signing in with Google:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="flex justify-center mb-8">
            <Image
              src="/image copy.png"
              alt="CPR Framework"
              width={400}
              height={400}
              className="rounded-full"
              priority
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              A structured goal-setting framework with{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                AI-powered validation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Define your mindset, clarify your purpose, and commit to measurable results.
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center pt-8 max-w-md mx-auto">
            <Button
              size="lg"
              className="w-full text-lg px-8 py-6 h-auto bg-white text-black hover:bg-gray-50 hover:shadow-lg transition-all duration-200 font-semibold"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign in with Google'}
            </Button>

            <Link href="/beta-waitlist" className="w-full">
              <Button
                size="lg"
                className="w-full text-lg px-8 py-6 h-auto bg-slate-800/50 border-2 border-slate-600 text-white hover:bg-slate-700 hover:border-slate-500 transition-all duration-200 font-semibold backdrop-blur-sm"
              >
                Sign up for Momentum Mentor BETA Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
