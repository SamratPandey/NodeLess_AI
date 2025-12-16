export interface WorkflowStep {
  step: number;
  action: string;
  params: Record<string, any>;
  description: string;
}

export interface Workflow {
  workflow: WorkflowStep[];
  estimated_time: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface ExecutionResult {
  success: boolean;
  data: any;
  metadata: {
    completed_at: string;
    duration_ms?: number;
    [key: string]: any;
  };
  step_number?: number;
  action_name?: string;
  step_description?: string;
  execution_time?: number;
  error?: string;
}

export interface WorkflowExecution {
  execution_id: string;
  status: 'running' | 'completed' | 'failed';
  workflow: Workflow;
  results: ExecutionResult[];
  execution_time: number;
  completed_at: string;
  success: boolean;
  error?: string;
}

export interface WorkflowResponse {
  success: boolean;
  workflow_id: string;
  execution_id: string;
  workflow: Workflow;
  execution: WorkflowExecution;
  prompt: string;
  error?: string;
}

export interface SampleWorkflow {
  prompt: string;
  workflow: Workflow;
}

export interface AgentStatus {
  model: string;
  provider: string;
  status: 'configured' | 'missing_api_key';
  samples_available: number;
  templates_available: number;
}