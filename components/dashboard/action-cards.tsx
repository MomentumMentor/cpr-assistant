'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClipboardCheck, Edit, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function ActionCards() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleCreateCPR = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('cpr_sessions')
      .insert({
        user_id: user?.id,
        user_name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return;
    }

    router.push(`/cpr/${data.id}/edit`);
  };

  const handleViewMyCPRs = () => {
    const cprList = document.getElementById('cpr-list');
    if (cprList) {
      cprList.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['.txt', '.docx', '.pdf'];
    const fileExt = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      setUploadError('Please upload a .txt, .docx, or .pdf file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-cpr', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { session } = await response.json();

      setUploadDialogOpen(false);
      router.push(`/cpr/${session.id}/edit`);
      router.refresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#1a2942]/10 flex items-center justify-center group-hover:bg-[#1a2942]/20 transition-colors">
              <ClipboardCheck className="w-10 h-10 text-[#1a2942]" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#1a2942]">CREATE A CPR</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                This tool will help you build a CPR, teach you best practices and, if you want, analyze it.
              </p>
            </div>
            <Button
              onClick={handleCreateCPR}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a2942] hover:from-amber-300 hover:to-yellow-400 font-semibold py-6 text-base shadow-md"
              size="lg"
            >
              Start New CPR
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <Edit className="w-10 h-10 text-amber-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#1a2942]">UPDATE EXISTING CPR</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                CPRs are not set in stone. They are a tool to accomplish. If circumstances or life changes... here we can change the CPR to accommodate.
              </p>
            </div>
            <Button
              onClick={handleViewMyCPRs}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a2942] hover:from-amber-300 hover:to-yellow-400 font-semibold py-6 text-base shadow-md"
              size="lg"
            >
              View My CPRs
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
              <Upload className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-[#1a2942]">UPLOAD YOUR OWN CPR</h3>
              <p className="text-slate-700 text-sm leading-relaxed">
                For Tracking, Storage, Analysis and if you want help modifying or improving your CPR.
              </p>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1a2942] hover:from-amber-300 hover:to-yellow-400 font-semibold py-6 text-base shadow-md"
              size="lg"
            >
              Upload CPR
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#1a2942]">Upload Your CPR</DialogTitle>
            <DialogDescription className="text-base text-slate-700">
              Upload an existing CPR document in .txt, .docx, or .pdf format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {uploadError}
              </div>
            )}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-12 hover:border-amber-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-[#1a2942] hover:text-amber-600 font-semibold">
                  Click to upload
                </span>
                <span className="text-slate-600"> or drag and drop</span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">TXT, DOCX or PDF (MAX. 10MB)</p>
            </div>
            {uploading && (
              <div className="text-center text-sm text-slate-600">
                Uploading...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
