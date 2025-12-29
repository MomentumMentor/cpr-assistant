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
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#1e3a5f] to-[#152238] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-300 text-lg">
                Manage and view all your CPR documents
              </p>
            </div>

            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <PlayCircle className="w-5 h-5 mr-2" />
              Training Video
            </Button>
          </div>

          <ActionCards />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Your CPRs</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/cprs?filter=all">
                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-amber-300">{totalSessions}</CardTitle>
                    <CardDescription className="text-base text-gray-300">Total CPRs</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/cprs?filter=in_progress">
                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-blue-300">{draftSessions}</CardTitle>
                    <CardDescription className="text-base text-gray-300">In Progress</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/cprs?filter=committed">
                <Card className="shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-green-300">{completedSessions}</CardTitle>
                    <CardDescription className="text-base text-gray-300">Committed</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="space-y-4" id="cpr-list">
              <h2 className="text-2xl font-bold text-white">Recent CPRs</h2>
              <div className="grid grid-cols-1 gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-xl transition-all shadow-lg bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg text-white">{session.user_name}'s CPR</CardTitle>
                            {session.committed_at && (
                              <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Committed
                              </Badge>
                            )}
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                              {session.pathway}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-gray-300">
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
                          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
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
              <h2 className="text-2xl font-bold text-white">Recent CPRs</h2>
              <Card className="border-dashed border-2 shadow-lg bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-white">No CPRs yet</CardTitle>
                    <CardDescription className="max-w-md text-base text-gray-300">
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
