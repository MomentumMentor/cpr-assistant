import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600">
                Manage and view all your CPR documents
              </p>
            </div>

            <Link href="/cpr/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create New CPR
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{totalSessions}</CardTitle>
                <CardDescription>Total CPRs</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{draftSessions}</CardTitle>
                <CardDescription>In Progress</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{completedSessions}</CardTitle>
                <CardDescription>Committed</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {sessions && sessions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
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
                        <Button variant="outline">
                          {session.committed_at ? 'View' : 'Continue'}
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>

                <div className="space-y-2">
                  <CardTitle className="text-xl">No CPRs yet</CardTitle>
                  <CardDescription className="max-w-md">
                    Get started by creating your first Context-Purpose-Results document.
                    Click the button above to begin.
                  </CardDescription>
                </div>

                <Link href="/cpr/new">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First CPR
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
