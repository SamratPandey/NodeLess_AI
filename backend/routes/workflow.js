import express from 'express';
import { dbHelpers } from '../db/index.js';
import { workflowAgent } from '../agent/index.js';
import { workflowExecutor } from '../executor/index.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Workflow API is working!',
    timestamp: new Date().toISOString()
  });
});

// Agent status
router.get('/agent/status', (req, res) => {
  try {
    const status = workflowAgent.getStatus();
    res.json({
      success: true,
      agent: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sample workflows
router.get('/samples', (req, res) => {
  try {
    const samples = workflowAgent.getSampleWorkflows();
    res.json({
      success: true,
      samples: samples
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test agent with sample
router.post('/test/:sampleName', async (req, res) => {
  try {
    const { sampleName } = req.params;
    const result = await workflowAgent.testWithSample(sampleName);
    
    res.json({
      success: result.success,
      test_result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/debug/config', (req, res) => {
  res.json({
    success: true,
    config: {
      gemini_api_key_configured: !!process.env.GEMINI_API_KEY,
      gemini_api_key_length: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      gemini_model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
      node_env: process.env.NODE_ENV,
      api_key_prefix: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'not set'
    }
  });
});

router.post('/run', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string'
      });
    }

    console.log(`📝 New workflow request: "${prompt.substring(0, 50)}..."`);

    const workflow = await workflowAgent.generateWorkflow(prompt, {
      useCache: options.useCache !== false,
      cacheTTL: options.cacheTTL || 86400
    });

    const savedWorkflow = await dbHelpers.createWorkflow({
      name: `Workflow for: ${prompt.substring(0, 30)}...`,
      description: prompt,
      prompt: prompt,
      steps: workflow.workflow,
      estimated_time: workflow.estimated_time,
      complexity: workflow.complexity
    });

    const executionResult = await workflowExecutor.executeWorkflow(
      { ...workflow, id: savedWorkflow.id },
      prompt,
      options
    );

    res.json({
      success: true,
      workflow_id: savedWorkflow.id,
      execution_id: executionResult.execution_id,
      workflow: workflow,
      execution: executionResult,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('Workflow run error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = await workflowExecutor.getExecutionStatus(id);
    
    if (!status.found) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }
    
    res.json({
      success: true,
      execution_id: id,
      status: status.status,
      created_at: status.created_at,
      updated_at: status.updated_at,
      execution_time: status.execution_time,
      output: status.output
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const history = await workflowExecutor.getExecutionHistory(parseInt(limit));
    
    res.json({
      success: true,
      executions: history,
      total_count: history.length,
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/workflows', async (req, res) => {
  try {
    const workflows = await dbHelpers.getAllWorkflows();
    
    res.json({
      success: true,
      workflows: workflows,
      total_count: workflows.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await dbHelpers.getWorkflowById(id);
    
    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
    
    res.json({
      success: true,
      workflow: workflow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/generate-only', async (req, res) => {
  try {
    const { prompt, options = {} } = req.body;
    
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string'
      });
    }

    const workflow = await workflowAgent.generateWorkflow(prompt, options);
    
    res.json({
      success: true,
      workflow: workflow,
      prompt: prompt,
      note: 'Workflow generated but not executed. Use /run to execute.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/test-simple', async (req, res) => {
  try {
    const { prompt = "Create a simple test workflow" } = req.body;
    
    const mockWorkflow = {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: { input_type: "text", analysis_depth: "basic" },
          description: "Analyze the user's request"
        },
        {
          step: 2,
          action: "generate_content", 
          params: { content_type: "response", tone: "helpful" },
          description: "Generate helpful content"
        },
        {
          step: 3,
          action: "send_output",
          params: { delivery_method: "direct" },
          description: "Deliver results"
        }
      ],
      estimated_time: 15,
      complexity: "low"
    };

    const savedWorkflow = await dbHelpers.createWorkflow({
      name: `Test workflow: ${prompt.substring(0, 30)}...`,
      description: prompt,
      prompt: prompt,
      steps: mockWorkflow.workflow,
      estimated_time: mockWorkflow.estimated_time,
      complexity: mockWorkflow.complexity
    });

    const executionResult = await workflowExecutor.executeWorkflow(
      { ...mockWorkflow, id: savedWorkflow.id },
      prompt
    );

    res.json({
      success: true,
      workflow_id: savedWorkflow.id,
      execution_id: executionResult.execution_id,
      workflow: mockWorkflow,
      execution: executionResult,
      prompt: prompt,
      note: "This is a test workflow without Gemini AI"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/debug/test-gemini', async (req, res) => {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('Testing Gemini model:', process.env.GEMINI_MODEL);
    
    const testPrompt = "Say 'Hello from Gemini!' in a single sentence.";
    const result = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: testPrompt,
    });
    
    res.json({
      success: true,
      gemini_test: {
        prompt: testPrompt,
        response: result.text,
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      error_type: error.constructor.name,
      api_key_configured: !!process.env.GEMINI_API_KEY,
      suggestion: "Get a valid API key from https://aistudio.google.com/app/apikey"
    });
  }
});

export default router;