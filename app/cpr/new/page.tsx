import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NewCPR() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">CPR Creation Wizard</CardTitle>
                  <CardDescription>
                    AI-powered Context-Purpose-Results document builder
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-slate-400" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Coming Soon
                  </h2>
                  <p className="text-slate-600 max-w-md mx-auto">
                    The CPR Creation Wizard is under development. This feature will guide you
                    through creating comprehensive CPR documents with AI assistance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Link href="/dashboard">
                    <Button variant="outline">
                      Return to Dashboard
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button>
                      Go to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Step 1: Context</CardTitle>
                <CardDescription>
                  Define the background and situation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Step 2: Purpose</CardTitle>
                <CardDescription>
                  Clarify goals and objectives
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Step 3: Results</CardTitle>
                <CardDescription>
                  Document outcomes and achievements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
