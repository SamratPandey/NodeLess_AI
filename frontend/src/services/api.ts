import axios from 'axios';
import type { WorkflowResponse, AgentStatus, SampleWorkflow, WorkflowExecution } from '../types/workflow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export class WorkflowService {
  static async runWorkflow(
    prompt: string, 
    options?: { useCache?: boolean; cacheTTL?: number }
  ): Promise<WorkflowResponse> {
    const response = await api.post('/workflow/run', { prompt, options });
    return response.data;
  }

  static async generateWorkflow(
    prompt: string, 
    options?: { useCache?: boolean; cacheTTL?: number }
  ): Promise<{ success: boolean; workflow: any; prompt: string }> {
    const response = await api.post('/workflow/generate-only', { prompt, options });
    return response.data;
  }

  static async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const response = await api.get(`/workflow/status/${executionId}`);
    return response.data;
  }

  static async getExecutionHistory(limit = 10): Promise<{ executions: any[] }> {
    const response = await api.get(`/workflow/history?limit=${limit}`);
    return response.data;
  }

  static async getAgentStatus(): Promise<AgentStatus> {
    const response = await api.get('/workflow/agent/status');
    return response.data.agent;
  }

  static async getSamples(): Promise<Record<string, SampleWorkflow>> {
    const response = await api.get('/workflow/samples');
    return response.data.samples;
  }

  static async testSample(sampleName: string): Promise<any> {
    const response = await api.post(`/workflow/test/${sampleName}`);
    return response.data;
  }

  static async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get('/health', { baseURL: 'http://localhost:3001' });
    return response.data;
  }
}

export default WorkflowService;