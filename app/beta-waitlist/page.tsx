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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            You're on the Waitlist
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thanks for your interest! Your account is pending approval.
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Signed in as: <strong>{session.user.email}</strong>
          </p>
          <p className="mt-4 text-sm text-gray-500">
            You'll receive an email once you're approved to access the CPR Assistant.
          </p>
        </div>
        <div className="mt-8">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
