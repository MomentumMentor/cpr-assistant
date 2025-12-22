'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CPRSession,
  Context,
  Purpose,
  Result,
  CommunicationMode,
  Pathway,
  Section,
} from './types';

interface WizardState {
  sessionId: string | null;
  session: CPRSession | null;
  context: Context | null;
  purpose: Purpose | null;
  results: Result[];
  currentStep: number;
  userName: string;
  communicationMode: CommunicationMode | null;
  pathway: Pathway | null;
  intent: string;
  deadline: string;
  currentSection: Section | null;
}

interface WizardContextType {
  state: WizardState;
  updateState: (updates: Partial<WizardState>) => void;
  resetState: () => void;
  loadSession: (sessionId: string) => Promise<void>;
}

const initialState: WizardState = {
  sessionId: null,
  session: null,
  context: null,
  purpose: null,
  results: [],
  currentStep: 1,
  userName: '',
  communicationMode: null,
  pathway: null,
  intent: '',
  deadline: '',
  currentSection: null,
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);

  useEffect(() => {
    const saved = localStorage.getItem('wizard-state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load wizard state:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.sessionId) {
      localStorage.setItem('wizard-state', JSON.stringify(state));
    }
  }, [state]);

  const updateState = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
    localStorage.removeItem('wizard-state');
  };

  const loadSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/session/${sessionId}`);
      if (!response.ok) throw new Error('Failed to load session');

      const data = await response.json();
      setState({
        ...initialState,
        sessionId: data.session.id,
        session: data.session,
        context: data.context,
        purpose: data.purpose,
        results: data.results || [],
        userName: data.session.user_name,
        communicationMode: data.session.communication_mode,
        pathway: data.session.pathway,
        intent: data.session.intent || '',
        deadline: data.session.deadline || '',
        currentSection: data.session.current_step as Section,
      });
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  };

  return (
    <WizardContext.Provider value={{ state, updateState, resetState, loadSession }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
