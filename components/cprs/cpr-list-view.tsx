'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, MoreVertical, Download, Trash2, FileText, Calendar, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CprSession {
  id: string;
  user_name: string;
  context: string;
  purpose: string;
  committed_at: string | null;
  created_at: string;
  deadline: string | null;
  pathway: string;
  uploaded_file_name?: string;
}

interface CprListViewProps {
  sessions: CprSession[];
  filter: string;
}

export function CprListView({ sessions, filter }: CprListViewProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const getTitle = () => {
    if (filter === 'in_progress') return 'CPRs In Progress';
    if (filter === 'committed') return 'Committed CPRs';
    return 'All CPRs';
  };

  const handleDelete = async () => {
    if (!sessionToDelete) return;

    try {
      const { error } = await supabase
        .from('cpr_sessions')
        .delete()
        .eq('id', sessionToDelete);

      if (error) throw error;

      toast.success('CPR deleted successfully');
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting CPR:', error);
      toast.error('Failed to delete CPR');
    }
  };

  const handleExport = async (sessionId: string, format: 'image' | 'docx') => {
    setExporting(sessionId);

    try {
      const response = await fetch(`/api/export-cpr?sessionId=${sessionId}&format=${format}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cpr-${sessionId}.${format === 'image' ? 'png' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`CPR exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting CPR:', error);
      toast.error('Failed to export CPR');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2942] via-[#1e3a5f] to-[#152238] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white">{getTitle()}</h1>
              <p className="text-gray-300 mt-1">{sessions.length} CPR{sessions.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>

          {sessions.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-2xl text-white">No CPRs found</CardTitle>
                  <CardDescription className="max-w-md text-gray-300">
                    {filter === 'in_progress' && "You don't have any CPRs in progress."}
                    {filter === 'committed' && "You haven't committed any CPRs yet."}
                    {filter === 'all' && "You haven't created any CPRs yet."}
                  </CardDescription>
                </div>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a2942] hover:from-amber-300 hover:to-yellow-400">
                    Go to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl text-white">
                            {session.uploaded_file_name || `${session.user_name}'s CPR`}
                          </CardTitle>
                          {session.committed_at && (
                            <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Committed
                            </Badge>
                          )}
                          {session.pathway && (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-400/30 capitalize">
                              {session.pathway}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 flex-wrap text-gray-300">
                          <span>Created {format(new Date(session.created_at), 'PPP')}</span>
                          {session.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Deadline: {format(new Date(session.deadline), 'PPP')}
                            </span>
                          )}
                        </CardDescription>
                        {session.context && (
                          <p className="text-sm text-gray-300 mt-2">
                            <span className="font-semibold text-amber-300">Context:</span> {session.context}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={session.committed_at ? `/cpr/${session.id}/complete` : `/cpr/${session.id}/edit`}>
                          <Button
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            {session.committed_at ? 'View' : 'Continue'}
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1e3a5f] border-white/20 text-white">
                            <DropdownMenuItem
                              onClick={() => handleExport(session.id, 'image')}
                              disabled={exporting === session.id}
                              className="hover:bg-white/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export as Image
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExport(session.id, 'docx')}
                              disabled={exporting === session.id}
                              className="hover:bg-white/10"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export as DOCX
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSessionToDelete(session.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1e3a5f] border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              This action cannot be undone. This will permanently delete this CPR and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
