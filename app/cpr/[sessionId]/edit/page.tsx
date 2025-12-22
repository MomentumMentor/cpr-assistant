'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WizardProvider, useWizard } from '@/lib/wizard-context';
import { StatusFooter } from '@/components/status-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, CalendarIcon, Lock, Edit, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ValidationResponse } from '@/lib/types';

function EditContent() {
  const params = useParams();
  const router = useRouter();
  const { state, updateState, loadSession } = useWizard();
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<'context' | 'purpose' | 'results'>('context');
  const [contextDraft, setContextDraft] = useState('');
  const [purposeDraft, setPurposeDraft] = useState('');
  const [resultsDraft, setResultsDraft] = useState<Array<{
    id?: string;
    content: string;
    completion_date: string;
    control_level: string | null;
  }>>([{ content: '', completion_date: '', control_level: null }]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await loadSession(params.sessionId as string);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load session:', error);
        router.push('/dashboard');
      }
    };

    loadData();
  }, [params.sessionId]);

  useEffect(() => {
    if (state.context) setContextDraft(state.context.content);
    if (state.purpose) setPurposeDraft(state.purpose.content);
    if (state.results && state.results.length > 0) {
      setResultsDraft(state.results.map(r => ({
        id: r.id,
        content: r.content,
        completion_date: r.completion_date,
        control_level: r.control_level,
      })));
    }

    if (state.pathway === 'cpr' && !state.context?.locked_at) {
      setCurrentSection('context');
    } else if (state.pathway === 'rpc' && !state.results.some(r => r.locked_at)) {
      setCurrentSection('results');
    }
  }, [state]);

  const wordCount = contextDraft.trim().split(/\s+/).filter(w => w.length > 0).length;

  const handleValidate = async () => {
    setValidating(true);
    setValidation(null);

    try {
      let content;
      if (currentSection === 'context') content = contextDraft;
      else if (currentSection === 'purpose') content = purposeDraft;
      else content = resultsDraft;

      const attemptCount = currentSection === 'context'
        ? (state.context?.attempt_count || 0) + 1
        : currentSection === 'purpose'
        ? (state.purpose?.attempt_count || 0) + 1
        : 1;

      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: currentSection,
          content,
          pathway: state.pathway,
          attemptCount,
          deadline: state.deadline,
          mode: state.communicationMode,
          existingContext: state.context?.content,
          existingPurpose: state.purpose?.content,
        }),
      });

      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handleLock = async () => {
    setSaving(true);

    try {
      let content;
      if (currentSection === 'context') content = contextDraft;
      else if (currentSection === 'purpose') content = purposeDraft;
      else content = resultsDraft;

      const response = await fetch('/api/section/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          section: currentSection,
          content,
          locked: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      await loadSession(params.sessionId as string);
      setShowLockModal(false);
      setValidation(null);

      const allLocked = state.context?.locked_at && state.purpose?.locked_at && state.results.some(r => r.locked_at);
      if (allLocked) {
        router.push(`/cpr/${state.sessionId}/complete`);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading session...</p>
      </div>
    );
  }

  const renderSection = () => {
    if (currentSection === 'context') {
      const isLocked = !!state.context?.locked_at;

      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Context
                  {isLocked && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Locked</Badge>}
                </CardTitle>
                <CardDescription>
                  {state.communicationMode === 'friendly'
                    ? 'Your mindset or attitude (1-5 words only)'
                    : 'Define your operational mindset (1-5 words)'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLocked ? (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-lg font-medium">{state.context?.content}</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., You Only Live Once"
                    value={contextDraft}
                    onChange={(e) => setContextDraft(e.target.value)}
                    disabled={isLocked}
                  />
                  <p className="text-xs text-slate-500">
                    Word count: {wordCount}/5
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 h-4" />
                  <AlertDescription>
                    <strong>Examples:</strong> "Warrior", "Servant Leader", "Prepared Professional", "You Only Live Once"
                  </AlertDescription>
                </Alert>

                {validation && (
                  <Alert variant={validation.valid ? 'default' : 'destructive'}>
                    <AlertDescription>
                      <p className="font-medium">{validation.feedback}</p>
                      {validation.violations.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {validation.violations.map((v, i) => (
                            <li key={i}>• {v}</li>
                          ))}
                        </ul>
                      )}
                      {validation.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {validation.suggestions.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      )}
                      {validation.exampleOption && (
                        <div className="mt-3 p-2 bg-slate-100 rounded">
                          <p className="text-sm font-medium">Example:</p>
                          <p className="text-sm">{validation.exampleOption}</p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleValidate} disabled={validating || wordCount < 1 || wordCount > 5}>
                    {validating ? 'Validating...' : 'Submit for Review'}
                  </Button>
                  {validation?.valid && (
                    <Button onClick={() => setShowLockModal(true)} variant="default">
                      <Lock className="w-4 h-4 mr-2" />
                      Lock In
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    if (currentSection === 'purpose') {
      const isLocked = !!state.purpose?.locked_at;

      return (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Purpose
                  {isLocked && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1" />Locked</Badge>}
                </CardTitle>
                <CardDescription>
                  To [goal] by [how] so that [impact]
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLocked ? (
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-lg">{state.purpose?.content}</p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="To achieve X by doing Y so that Z benefits..."
                  value={purposeDraft}
                  onChange={(e) => setPurposeDraft(e.target.value)}
                  rows={4}
                  disabled={isLocked}
                />

                {validation && (
                  <Alert variant={validation.valid ? 'default' : 'destructive'}>
                    <AlertDescription>
                      <p className="font-medium">{validation.feedback}</p>
                      {validation.violations.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {validation.violations.map((v, i) => (
                            <li key={i}>• {v}</li>
                          ))}
                        </ul>
                      )}
                      {validation.suggestions.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {validation.suggestions.map((s, i) => (
                            <li key={i}>• {s}</li>
                          ))}
                        </ul>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleValidate} disabled={validating || purposeDraft.length < 10}>
                    {validating ? 'Validating...' : 'Submit for Review'}
                  </Button>
                  {validation?.valid && (
                    <Button onClick={() => setShowLockModal(true)} variant="default">
                      <Lock className="w-4 h-4 mr-2" />
                      Lock In
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
          <CardDescription>
            Define measurable outcomes in past tense
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resultsDraft.map((result, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Result {index + 1}</h4>
                {resultsDraft.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResultsDraft(resultsDraft.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <Textarea
                placeholder="Achieved X, completed Y, delivered Z..."
                value={result.content}
                onChange={(e) => {
                  const updated = [...resultsDraft];
                  updated[index].content = e.target.value;
                  setResultsDraft(updated);
                }}
                rows={3}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">Completion Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {result.completion_date ? format(new Date(result.completion_date), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={result.completion_date ? new Date(result.completion_date) : undefined}
                      onSelect={(date) => {
                        const updated = [...resultsDraft];
                        updated[index].completion_date = date?.toISOString() || '';
                        setResultsDraft(updated);
                      }}
                      disabled={(date) => date < new Date() || (state.deadline ? date > new Date(state.deadline) : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setResultsDraft([...resultsDraft, { content: '', completion_date: '', control_level: null }])}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Result
          </Button>

          {validation && (
            <Alert variant={validation.valid ? 'default' : 'destructive'}>
              <AlertDescription>
                <p className="font-medium">{validation.feedback}</p>
                {validation.violations.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {validation.violations.map((v, i) => (
                      <li key={i}>• {v}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={handleValidate} disabled={validating}>
              {validating ? 'Validating...' : 'Submit for Review'}
            </Button>
            {validation?.valid && (
              <Button onClick={() => setShowLockModal(true)} variant="default">
                <Lock className="w-4 h-4 mr-2" />
                Lock In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-2">
            <Button
              variant={currentSection === 'context' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('context')}
              disabled={state.pathway === 'rpc' && !state.purpose?.locked_at}
            >
              Context
              {state.context?.locked_at && <CheckCircle className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              variant={currentSection === 'purpose' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('purpose')}
              disabled={(state.pathway === 'cpr' && !state.context?.locked_at) || (state.pathway === 'rpc' && !state.results.some(r => r.locked_at))}
            >
              Purpose
              {state.purpose?.locked_at && <CheckCircle className="w-4 h-4 ml-2" />}
            </Button>
            <Button
              variant={currentSection === 'results' ? 'default' : 'outline'}
              onClick={() => setCurrentSection('results')}
              disabled={state.pathway === 'cpr' && !state.purpose?.locked_at}
            >
              Results
              {state.results.some(r => r.locked_at) && <CheckCircle className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {renderSection()}
        </div>
      </div>

      <Dialog open={showLockModal} onOpenChange={setShowLockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock {currentSection}?</DialogTitle>
            <DialogDescription>
              Are you ready to lock in this {currentSection}? Once locked, it cannot be easily changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLockModal(false)}>
              No, Revise
            </Button>
            <Button onClick={handleLock} disabled={saving}>
              {saving ? 'Locking...' : 'Yes, Lock It In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StatusFooter />
    </div>
  );
}

export default function EditPage() {
  return (
    <WizardProvider>
      <EditContent />
    </WizardProvider>
  );
}
