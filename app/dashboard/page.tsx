import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, CheckCircle, ClipboardCheck, Edit, Upload, PlayCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { ActionCards } from '@/components/dashboard/action-cards';

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from('cpr_sessions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  const totalSessions = sessions?.length || 0;
  const draftSessions = sessions?.filter(s => !s.committed_at).length || 0;
  const completedSessions = sessions?.filter(s => s.committed_at).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-[#1E4D6B]">Dashboard</h1>
              <p className="text-slate-600 text-lg">
                Manage and view all your CPR documents
              </p>
            </div>

            <Button variant="outline" size="lg" className="border-[#1E4D6B] text-[#1E4D6B] hover:bg-[#1E4D6B] hover:text-white">
              <PlayCircle className="w-5 h-5 mr-2" />
              Training Video
            </Button>
          </div>

          <ActionCards />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Your CPRs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-[#1E4D6B]">{totalSessions}</CardTitle>
                  <CardDescription className="text-base">Total CPRs</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-amber-600">{draftSessions}</CardTitle>
                  <CardDescription className="text-base">In Progress</CardDescription>
                </CardHeader>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-green-600">{completedSessions}</CardTitle>
                  <CardDescription className="text-base">Committed</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="space-y-4" id="cpr-list">
              <h2 className="text-2xl font-bold text-slate-900">Recent CPRs</h2>
              <div className="grid grid-cols-1 gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{session.user_name}'s CPR</CardTitle>
                          {session.committed_at && (
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Committed
                            </Badge>
                          )}
                          <Badge variant="outline" className="capitalize">
                            {session.pathway}
                          </Badge>
                        </div>
                        <CardDescription className="flex items-center gap-4">
                          <span>Created {format(new Date(session.created_at), 'PPP')}</span>
                          {session.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Deadline: {format(new Date(session.deadline), 'PPP')}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Link href={session.committed_at ? `/cpr/${session.id}/complete` : `/cpr/${session.id}/edit`}>
                        <Button variant="outline" className="border-[#1E4D6B] text-[#1E4D6B] hover:bg-[#1E4D6B] hover:text-white">
                          {session.committed_at ? 'View' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Recent CPRs</h2>
              <Card className="border-dashed border-2 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#1E4D6B]/10 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#1E4D6B]" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-slate-900">No CPRs yet</CardTitle>
                    <CardDescription className="max-w-md text-base">
                      Get started by creating your first Context-Purpose-Results document.
                      Use the action cards above to begin.
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
