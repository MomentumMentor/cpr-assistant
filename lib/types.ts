export type CommunicationMode = 'friendly' | 'executive';
export type Pathway = 'cpr' | 'rpc';
export type Section = 'context' | 'purpose' | 'results';
export type ControlLevel = 'direct' | 'partial' | 'none';
export type ObstacleCategory = 'internal' | 'external';

export interface CPRSession {
  id: string;
  user_id: string;
  user_name: string;
  communication_mode: CommunicationMode | null;
  pathway: Pathway | null;
  intent: string | null;
  deadline: string | null;
  current_step: string | null;
  committed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Context {
  id: string;
  session_id: string;
  content: string;
  locked_at: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

export interface Purpose {
  id: string;
  session_id: string;
  content: string;
  locked_at: string | null;
  attempt_count: number;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: string;
  session_id: string;
  content: string;
  completion_date: string;
  control_level: ControlLevel | null;
  locked_at: string | null;
  attempt_count: number;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface Obstacle {
  id: string;
  result_id: string;
  content: string;
  category: ObstacleCategory;
  created_at: string;
}

export interface ValidationResponse {
  valid: boolean;
  feedback: string;
  violations: string[];
  suggestions: string[];
  exampleOption?: string;
}

export interface SKYNETInhibitor {
  type: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
}

export interface SKYNETAnalysis {
  survivabilityRating: number;
  verdict: 'SUCCESS' | 'FAILURE';
  inhibitors: SKYNETInhibitor[];
}
