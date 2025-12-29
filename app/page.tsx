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
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#1e3a5f] to-[#152238] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="flex justify-center mb-8">
            <Image
              src="/cpr-assistant-logo-transparent.png"
              alt="CPR Framework"
              width={400}
              height={400}
              className="rounded-full shadow-2xl"
              priority
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              A structured goal-setting framework with{' '}
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                AI-powered validation
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Define your mindset, clarify your purpose, and commit to measurable results.
            </p>
          </div>

          <div className="flex flex-col gap-4 justify-center items-center pt-8 max-w-md mx-auto">
            <Button
              size="lg"
              className="w-full text-lg px-8 py-6 h-auto bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a2942] hover:from-amber-300 hover:to-yellow-400 hover:shadow-xl transition-all duration-200 font-semibold shadow-lg"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Sign in with Google'}
            </Button>

            <Link href="/beta-waitlist" className="w-full">
              <Button
                size="lg"
                className="w-full text-lg px-8 py-6 h-auto bg-white/10 border-2 border-amber-400/50 text-white hover:bg-white/20 hover:border-amber-300 transition-all duration-200 font-semibold backdrop-blur-sm shadow-lg"
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
