import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Plus, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Total CPRs</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Draft CPRs</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">0</CardTitle>
                <CardDescription>Completed CPRs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
