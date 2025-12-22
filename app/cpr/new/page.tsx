'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardProvider, useWizard } from '@/lib/wizard-context';
import { StatusFooter } from '@/components/status-footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertCircle, CalendarIcon, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

function WizardContent() {
  const { state, updateState } = useWizard();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const totalSteps = 6;
  const progress = (state.currentStep / totalSteps) * 100;

  const nextStep = () => {
    updateState({ currentStep: state.currentStep + 1 });
    setError('');
  };

  const prevStep = () => {
    updateState({ currentStep: state.currentStep - 1 });
    setError('');
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('cpr_sessions')
        .insert({
          user_id: user.id,
          user_name: state.userName,
          communication_mode: state.communicationMode,
          pathway: state.pathway,
          intent: state.intent,
          deadline: state.deadline,
          current_step: null,
        })
        .select()
        .single();

      if (error) throw error;

      updateState({ sessionId: data.id, session: data });
      nextStep();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-3xl">Welcome to CPR Assistant</CardTitle>
              <CardDescription>
                Let's set up your Context-Purpose-Results framework
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> CPR = Context, Purpose, Results framework (NOT cardiopulmonary resuscitation)
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  What name would you like me to call you?
                </label>
                <Input
                  placeholder="Enter your name"
                  value={state.userName}
                  onChange={(e) => updateState({ userName: e.target.value })}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => {
                  if (state.userName.length < 2) {
                    setError('Name must be at least 2 characters');
                    return;
                  }
                  nextStep();
                }}
                className="w-full"
                size="lg"
              >
                Continue <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Thank you, {state.userName}</CardTitle>
              <CardDescription>How would you like to communicate?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    state.communicationMode === 'friendly'
                      ? 'ring-2 ring-slate-900 bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateState({ communicationMode: 'friendly' })}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">Friendly Terms</CardTitle>
                    <CardDescription className="text-base">
                      Plain language, 7th-grade reading level, casual tone. Easy to understand and approachable.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    state.communicationMode === 'executive'
                      ? 'ring-2 ring-slate-900 bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateState({ communicationMode: 'executive' })}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">Executive Terms</CardTitle>
                    <CardDescription className="text-base">
                      Professional, precise, consultant-level language. Direct and efficient.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (!state.communicationMode) {
                      setError('Please select a communication mode');
                      return;
                    }
                    nextStep();
                  }}
                  className="flex-1"
                  size="lg"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Intent & Deadline</CardTitle>
              <CardDescription>
                {state.communicationMode === 'friendly'
                  ? 'Tell us why you\'re creating this CPR and when you need to finish'
                  : 'Define your intent and establish a completion deadline'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Why are you creating this CPR?
                </label>
                <Textarea
                  placeholder={
                    state.communicationMode === 'friendly'
                      ? 'Briefly explain your reason for using this framework...'
                      : 'Articulate your strategic intent...'
                  }
                  value={state.intent}
                  onChange={(e) => updateState({ intent: e.target.value })}
                  rows={4}
                />
                <p className="text-xs text-slate-500">
                  Minimum 20 characters ({state.intent.length}/20)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  What is your final deadline?
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !state.deadline && 'text-muted-foreground'
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {state.deadline ? format(new Date(state.deadline), 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={state.deadline ? new Date(state.deadline) : undefined}
                      onSelect={(date) => updateState({ deadline: date?.toISOString() || '' })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (state.intent.length < 20) {
                      setError('Intent must be at least 20 characters');
                      return;
                    }
                    if (!state.deadline) {
                      setError('Please select a deadline');
                      return;
                    }
                    nextStep();
                  }}
                  className="flex-1"
                  size="lg"
                >
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Training Video (Optional)</CardTitle>
              <CardDescription>
                Would you like to watch the 6-minute CPR Framework training video?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/VOnKMVmIvdo"
                  title="CPR Framework Training"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} className="flex-1" size="lg">
                  Continue <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Choose Your Pathway</CardTitle>
              <CardDescription>
                {state.communicationMode === 'friendly'
                  ? 'Which order would you like to work in?'
                  : 'Select your strategic framework pathway'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={`cursor-pointer transition-all ${
                    state.pathway === 'cpr'
                      ? 'ring-2 ring-slate-900 bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateState({ pathway: 'cpr' })}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">CPR (Standard)</CardTitle>
                    <CardDescription className="text-base">
                      Context → Purpose → Results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      {state.communicationMode === 'friendly'
                        ? 'Start with your mindset, then your goal, then prove it with results'
                        : 'Establish mindset, define strategic intent, demonstrate measurable outcomes'}
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all ${
                    state.pathway === 'rpc'
                      ? 'ring-2 ring-slate-900 bg-slate-50'
                      : 'hover:bg-slate-50'
                  }`}
                  onClick={() => updateState({ pathway: 'rpc' })}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">RPC (Reverse)</CardTitle>
                    <CardDescription className="text-base">
                      Results → Purpose → Context
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">
                      {state.communicationMode === 'friendly'
                        ? 'Start with what you want to achieve, then justify it, then set your mindset'
                        : 'Define outcomes, establish justification, determine requisite mindset'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button
                  onClick={() => {
                    if (!state.pathway) {
                      setError('Please select a pathway');
                      return;
                    }
                    createSession();
                  }}
                  className="flex-1"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Creating Session...' : (
                    <>Create CPR <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                Session Created!
              </CardTitle>
              <CardDescription>
                Your CPR session has been created. Let's start building your framework.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{state.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mode:</span>
                  <span className="capitalize">{state.communicationMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pathway:</span>
                  <span className="uppercase">{state.pathway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Deadline:</span>
                  <span>{state.deadline ? format(new Date(state.deadline), 'PPP') : 'Not set'}</span>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {state.pathway === 'cpr' ? (
                    'We\'ll guide you through Context, Purpose, and Results in that order.'
                  ) : (
                    'We\'ll start with Results, then Purpose, then Context. Results will be standalone outcomes that we\'ll justify later.'
                  )}
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => router.push(`/cpr/${state.sessionId}/edit`)}
                className="w-full"
                size="lg"
              >
                Start Building <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-2">
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 text-center">
              Step {state.currentStep} of {totalSteps}
            </p>
          </div>

          {renderStep()}
        </div>
      </div>
      <StatusFooter />
    </div>
  );
}

export default function NewCPRPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
