import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function BetaWaitlist() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/');
  }

  const { data: betaUser } = await supabase
    .from('beta_users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();

  if (betaUser?.approved_at) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#1e3a5f] to-[#152238] relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>

      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-lg p-8 border-0">
          <h2 className="mt-6 text-3xl font-extrabold text-[#1a2942]">
            You're on the Waitlist
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Thanks for your interest! Your account is pending approval.
          </p>
          <p className="mt-4 text-sm text-slate-700">
            Signed in as: <strong>{session.user.email}</strong>
          </p>
          <p className="mt-4 text-sm text-slate-600">
            You'll receive an email once you're approved to access the CPR Assistant.
          </p>
          <div className="mt-8">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-[#1a2942] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
