import { useState, useCallback } from 'react';
import { WorkflowService } from '../services/api';
import type { WorkflowResponse, WorkflowExecution } from '../types/workflow';

interface UseWorkflowState {
  isLoading: boolean;
  isGenerating: boolean;
  isExecuting: boolean;
  error: string | null;
  workflow: WorkflowResponse | null;
  executionStatus: WorkflowExecution | null;
}

export const useWorkflow = () => {
  const [state, setState] = useState<UseWorkflowState>({
    isLoading: false,
    isGenerating: false,
    isExecuting: false,
    error: null,
    workflow: null,
    executionStatus: null,
  });

  const runWorkflow = useCallback(async (prompt: string, options?: any) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        isGenerating: true,
        error: null 
      }));

      const result = await WorkflowService.runWorkflow(prompt, options);
      
      setState(prev => ({ 
        ...prev, 
        workflow: result, 
        isGenerating: false,
        isExecuting: true 
      }));

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isExecuting: false 
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isGenerating: false,
        isExecuting: false,
        error: error.response?.data?.error || error.message || 'An error occurred' 
      }));
      throw error;
    }
  }, []);

  const generateOnly = useCallback(async (prompt: string, options?: any) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isLoading: true, 
        isGenerating: true,
        error: null 
      }));

      const result = await WorkflowService.generateWorkflow(prompt, options);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isGenerating: false 
      }));

      return result;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isGenerating: false,
        error: error.response?.data?.error || error.message || 'An error occurred' 
      }));
      throw error;
    }
  }, []);

  const checkExecutionStatus = useCallback(async (executionId: string) => {
    try {
      const status = await WorkflowService.getExecutionStatus(executionId);
      setState(prev => ({ 
        ...prev, 
        executionStatus: status 
      }));
      return status;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: error.response?.data?.error || error.message || 'Failed to get status' 
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isGenerating: false,
      isExecuting: false,
      error: null,
      workflow: null,
      executionStatus: null,
    });
  }, []);

  return {
    ...state,
    runWorkflow,
    generateOnly,
    checkExecutionStatus,
    clearError,
    reset,
  };
};