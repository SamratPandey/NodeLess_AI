import { functionRegistry, validateAction } from '../functions/index.js';
import { dbHelpers } from '../db/index.js';

export class WorkflowExecutor {
  constructor() {
    this.maxRetries = 3;
    this.defaultTimeout = 30000;
  }

  async executeWorkflow(workflow, userInput, options = {}) {
    const executionId = this.generateExecutionId();
    
    try {
      const execution = await dbHelpers.createExecution({
        workflow_id: workflow.id || null,
        status: 'running',
        input: { prompt: userInput, options },
        output: null,
        execution_time: 0,
        steps: workflow.workflow || []
      });

      console.log(`🚀 Starting workflow execution: ${executionId}`);
      
      const startTime = Date.now();
      const context = {
        executionId,
        userInput,
        workflow_input: userInput, // Add this for backward compatibility
        workflowType: this.detectWorkflowType(userInput),
        stepResults: [],
        globalData: {}
      };

      this.validateWorkflowStructure(workflow);
      
      const results = await this.executeSteps(workflow.workflow, context);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      const finalResult = {
        execution_id: executionId,
        status: 'completed',
        workflow: workflow,
        results: results,
        execution_time: executionTime,
        completed_at: new Date().toISOString(),
        success: true
      };

      await dbHelpers.updateExecution(execution.id, {
        status: 'completed',
        output: finalResult,
        execution_time: executionTime
      });

      console.log(`✅ Workflow execution completed: ${executionId} (${executionTime}ms)`);
      return finalResult;

    } catch (error) {
      console.error(`❌ Workflow execution failed: ${executionId}`, error);
      
      const errorResult = {
        execution_id: executionId,
        status: 'failed',
        error: error.message,
        completed_at: new Date().toISOString(),
        success: false
      };

      try {
        const execution = await dbHelpers.getExecutionById(executionId);
        if (execution) {
          await dbHelpers.updateExecution(execution.id, {
            status: 'failed',
            output: errorResult
          });
        }
      } catch (dbError) {
        console.error('Failed to update execution status:', dbError);
      }

      throw error;
    }
  }

  async executeSteps(steps, context) {
    const results = [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        console.log(`⚡ Executing step ${step.step}: ${step.action}`);
        
        const stepResult = await this.executeStep(step, context);
        
        stepResult.step_number = step.step;
        stepResult.action_name = step.action;
        stepResult.function_name = step.action;
        
        results.push(stepResult);
        context.stepResults.push(stepResult);
        
        if (!stepResult.success) {
          throw new Error(`Step ${step.step} failed: ${stepResult.error}`);
        }
        
        console.log(`✓ Step ${step.step} completed successfully`);
        
      } catch (error) {
        console.error(`✗ Step ${step.step} failed:`, error.message);
        
        const failedResult = {
          step_number: step.step,
          action_name: step.action,
          success: false,
          error: error.message,
          completed_at: new Date().toISOString()
        };
        
        results.push(failedResult);
        throw new Error(`Workflow failed at step ${step.step}: ${error.message}`);
      }
    }
    
    return results;
  }

  async executeStep(step, context) {
    const { action, params = {}, description } = step;
    
    if (!validateAction(action)) {
      throw new Error(`Unknown action: ${action}`);
    }

    const functionDef = functionRegistry[action];
    const startTime = Date.now();
    
    try {
      // Enhanced context for real integrations
      const enhancedContext = {
        ...context,
        user_id: context.user_id || 'demo_user',
        session_id: context.session_id || this.generateSessionId(),
        timestamp: new Date().toISOString(),
        request_id: context.executionId,
        // Include previous step results for chaining
        previous_results: context.stepResults || [],
        // Add workflow metadata
        workflow_metadata: {
          type: context.workflowType,
          step_count: context.totalSteps || 0,
          current_step: step.step
        }
      };
      
      const result = await Promise.race([
        functionDef.execute(params, enhancedContext),
        this.createTimeout(this.defaultTimeout)
      ]);
      
      const endTime = Date.now();
      
      // Enhanced result formatting for real actions
      const formattedResult = {
        ...result,
        step_description: description,
        execution_time: endTime - startTime,
        completed_at: new Date().toISOString(),
        // Add integration tracking if this was a real action
        integration_used: this.extractIntegrationInfo(action, result),
        // Add success metrics
        metrics: {
          execution_time_ms: endTime - startTime,
          success: result.success !== false,
          retry_count: 0 // TODO: implement retries for failed actions
        }
      };
      
      // Log successful integrations
      if (this.isRealIntegrationAction(action) && result.success !== false) {
        console.log(`🔗 Integration action completed: ${action}`, {
          provider: params.service_provider || params.provider,
          action_type: params.action_type || action,
          execution_time: endTime - startTime
        });
      }
      
      return formattedResult;
      
    } catch (error) {
      if (error.message === 'Step execution timeout') {
        throw new Error(`Step timed out after ${this.defaultTimeout}ms`);
      }
      
      // Enhanced error handling for integration failures
      if (this.isRealIntegrationAction(action)) {
        console.error(`🚫 Integration action failed: ${action}`, {
          error: error.message,
          provider: params.service_provider || params.provider,
          action_type: params.action_type || action
        });
      }
      
      throw error;
    }
  }

  isRealIntegrationAction(action) {
    const integrationActions = [
      'execute_action',
      'collect_credentials', 
      'manage_integrations',
      'setup_integration'
    ];
    return integrationActions.includes(action);
  }

  extractIntegrationInfo(action, result) {
    if (!this.isRealIntegrationAction(action)) {
      return null;
    }
    
    return {
      action_type: action,
      provider: result?.data?.service_provider || result?.data?.provider || 'unknown',
      integration_id: result?.data?.integration_id || null,
      status: result?.data?.status || (result?.success ? 'success' : 'failed')
    };
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateWorkflowStructure(workflow) {
    if (!workflow || typeof workflow !== 'object') {
      throw new Error('Invalid workflow: must be an object');
    }
    
    if (!Array.isArray(workflow.workflow)) {
      throw new Error('Invalid workflow: must contain workflow array');
    }
    
    if (workflow.workflow.length === 0) {
      throw new Error('Invalid workflow: workflow cannot be empty');
    }
    
    workflow.workflow.forEach((step, index) => {
      if (!step.step || !step.action) {
        throw new Error(`Invalid step ${index + 1}: missing step number or action`);
      }
      
      if (!validateAction(step.action)) {
        throw new Error(`Invalid step ${index + 1}: unknown action "${step.action}"`);
      }
      
      if (!step.params || typeof step.params !== 'object') {
        throw new Error(`Invalid step ${index + 1}: params must be an object`);
      }
    });
  }

  detectWorkflowType(userInput) {
    const input = userInput.toLowerCase();
    
    if (input.includes('social') || input.includes('post')) return 'social_media';
    if (input.includes('email') || input.includes('message')) return 'email';
    if (input.includes('document') || input.includes('report')) return 'document';
    if (input.includes('code') || input.includes('review')) return 'code';
    if (input.includes('resume') || input.includes('cv')) return 'resume';
    if (input.includes('calendar') || input.includes('schedule')) return 'planning';
    
    return 'general';
  }

  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  createTimeout(ms) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Step execution timeout')), ms);
    });
  }

  async getExecutionStatus(executionId) {
    try {
      const execution = await dbHelpers.getExecutionById(executionId);
      if (!execution) {
        return { found: false, error: 'Execution not found' };
      }
      
      return {
        found: true,
        status: execution.status,
        created_at: execution.created_at,
        updated_at: execution.updated_at,
        execution_time: execution.execution_time,
        output: execution.output
      };
    } catch (error) {
      return { found: false, error: error.message };
    }
  }

  async getExecutionHistory(limit = 10) {
    try {
      const executions = await dbHelpers.getAllExecutions();
      return executions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
        .map(exec => ({
          id: exec.id,
          status: exec.status,
          created_at: exec.created_at,
          execution_time: exec.execution_time,
          workflow_type: exec.input?.workflowType || 'unknown'
        }));
    } catch (error) {
      throw new Error(`Failed to get execution history: ${error.message}`);
    }
  }
}

export const workflowExecutor = new WorkflowExecutor();