import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 text-white mb-4">
            <FileText className="w-10 h-10" />
          </div>

          <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
            CPR Assistant
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create structured Context-Purpose-Results documents with AI assistance.
            Streamline your documentation workflow and maintain consistency across your projects.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/cpr/new">
              <Button size="lg" className="text-lg px-8 py-6 h-auto">
                Start New CPR
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                View Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="text-slate-900 font-semibold text-lg mb-2">Context</div>
              <p className="text-slate-600 text-sm">
                Define the background and situation for your documentation
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="text-slate-900 font-semibold text-lg mb-2">Purpose</div>
              <p className="text-slate-600 text-sm">
                Clarify the goals and objectives of your work
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="text-slate-900 font-semibold text-lg mb-2">Results</div>
              <p className="text-slate-600 text-sm">
                Document outcomes, metrics, and key achievements
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
