import express from 'express';
import { workflowAgent } from '../agent/index.js';
import { workflowExecutor } from '../executor/index.js';

const router = express.Router();

// Test real integration workflow generation and execution
router.post('/test-integration', async (req, res) => {
  try {
    const { 
      scenario = 'email',
      provider = 'gmail',
      test_action = 'send_email',
      test_data = {}
    } = req.body;

    console.log(`🧪 Testing integration scenario: ${scenario} with ${provider}`);

    // Generate workflow for integration scenario
    let testPrompt = '';
    switch (scenario) {
      case 'email':
        testPrompt = `Set up Gmail integration and send an email to john@example.com with subject "Test Email" and message "This is a test email from NodeLess AI"`;
        break;
      case 'social':
        testPrompt = `Set up Twitter integration and post a tweet saying "Hello from NodeLess AI! 🤖 #automation #ai"`;
        break;
      case 'storage':
        testPrompt = `Set up AWS S3 integration and upload a file called "test.txt" to the "my-bucket" bucket`;
        break;
      case 'database':
        testPrompt = `Set up MySQL integration and store user data in the "users" table`;
        break;
      default:
        testPrompt = test_data.prompt || 'Set up a basic integration and perform a test action';
    }

    // Step 1: Generate workflow with Gemini
    const workflow = await workflowAgent.generateWorkflow(testPrompt, {
      useCache: false
    });

    // Step 2: Execute the workflow
    const execution = await workflowExecutor.executeWorkflow(
      workflow,
      testPrompt,
      { test_mode: true }
    );

    // Step 3: Analyze results
    const analysis = analyzeIntegrationResults(execution, scenario);

    res.json({
      success: true,
      test_scenario: scenario,
      provider: provider,
      prompt: testPrompt,
      generated_workflow: workflow,
      execution_results: execution,
      analysis: analysis,
      recommendations: generateRecommendations(analysis)
    });

  } catch (error) {
    console.error('Integration test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      test_scenario: req.body.scenario || 'unknown'
    });
  }
});

// Test specific integration functions
router.post('/test-function/:functionName', async (req, res) => {
  try {
    const { functionName } = req.params;
    const { params = {}, context = {} } = req.body;

    console.log(`🔧 Testing function: ${functionName}`);

    const { functionRegistry } = await import('../functions/index.js');
    
    if (!functionRegistry[functionName]) {
      return res.status(404).json({
        success: false,
        error: `Function ${functionName} not found`,
        available_functions: Object.keys(functionRegistry)
      });
    }

    const testContext = {
      ...context,
      user_id: 'test_user',
      session_id: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      test_mode: true
    };

    const startTime = Date.now();
    const result = await functionRegistry[functionName].execute(params, testContext);
    const endTime = Date.now();

    res.json({
      success: true,
      function_name: functionName,
      test_params: params,
      test_context: testContext,
      result: result,
      execution_time: endTime - startTime,
      test_status: result.success !== false ? 'passed' : 'failed'
    });

  } catch (error) {
    console.error(`Function test error for ${req.params.functionName}:`, error);
    res.status(500).json({
      success: false,
      function_name: req.params.functionName,
      error: error.message
    });
  }
});

// Get integration capabilities
router.get('/capabilities', async (req, res) => {
  try {
    const { functionRegistry } = await import('../functions/index.js');
    
    const capabilities = {
      total_functions: Object.keys(functionRegistry).length,
      content_functions: [
        'analyze_input',
        'generate_content', 
        'format_output',
        'send_output',
        'extract_data',
        'summarize_content',
        'validate_data',
        'transform_data'
      ],
      integration_functions: [
        'collect_credentials',
        'execute_action',
        'manage_integrations',
        'setup_integration'
      ],
      supported_services: {
        email: ['gmail', 'smtp', 'sendgrid'],
        social: ['twitter', 'facebook', 'linkedin'],
        storage: ['aws_s3', 'google_drive'],
        database: ['mysql', 'postgresql', 'mongodb', 'redis'],
        sms: ['twilio'],
        api: ['custom']
      },
      action_types: [
        'send_email',
        'post_social', 
        'upload_file',
        'store_data',
        'send_sms',
        'make_api_call'
      ]
    };

    res.json({
      success: true,
      capabilities: capabilities,
      examples: {
        email_workflow: 'Set up Gmail and send welcome email to new users',
        social_workflow: 'Connect Twitter and post daily updates',
        storage_workflow: 'Upload reports to AWS S3 every week',
        database_workflow: 'Store customer data in MySQL database'
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate integration setup
router.post('/validate-setup', async (req, res) => {
  try {
    const { service_type, provider, credentials = {} } = req.body;

    console.log(`🔍 Validating setup for ${provider} ${service_type}`);

    const validation = {
      service_type,
      provider,
      validation_results: [],
      overall_status: 'pending'
    };

    // Check if credentials are provided
    if (Object.keys(credentials).length === 0) {
      validation.validation_results.push({
        check: 'Credentials Check',
        status: 'warning',
        message: 'No credentials provided - setup required'
      });
    } else {
      validation.validation_results.push({
        check: 'Credentials Check', 
        status: 'passed',
        message: 'Credentials structure validated'
      });
    }

    // Check function availability
    const { functionRegistry } = await import('../functions/index.js');
    const hasCollectCredentials = !!functionRegistry['collect_credentials'];
    const hasExecuteAction = !!functionRegistry['execute_action'];
    const hasManageIntegrations = !!functionRegistry['manage_integrations'];

    validation.validation_results.push({
      check: 'Function Availability',
      status: hasCollectCredentials && hasExecuteAction && hasManageIntegrations ? 'passed' : 'failed',
      message: `Integration functions available: collect_credentials=${hasCollectCredentials}, execute_action=${hasExecuteAction}, manage_integrations=${hasManageIntegrations}`
    });

    // Check service support
    const supportedServices = {
      email: ['gmail', 'smtp', 'sendgrid'],
      social: ['twitter', 'facebook', 'linkedin'], 
      storage: ['aws_s3', 'google_drive'],
      database: ['mysql', 'postgresql', 'mongodb']
    };

    const isServiceSupported = supportedServices[service_type]?.includes(provider);
    validation.validation_results.push({
      check: 'Service Support',
      status: isServiceSupported ? 'passed' : 'warning',
      message: isServiceSupported ? 
        `${provider} is supported for ${service_type}` :
        `${provider} support for ${service_type} may be limited`
    });

    // Determine overall status
    const hasFailures = validation.validation_results.some(r => r.status === 'failed');
    const hasWarnings = validation.validation_results.some(r => r.status === 'warning');
    
    validation.overall_status = hasFailures ? 'failed' : hasWarnings ? 'warning' : 'passed';

    res.json({
      success: true,
      validation: validation,
      ready_for_integration: validation.overall_status === 'passed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

function analyzeIntegrationResults(execution, scenario) {
  const analysis = {
    workflow_generated: !!execution.workflow,
    total_steps: execution.results ? execution.results.length : 0,
    successful_steps: 0,
    failed_steps: 0,
    integration_steps: 0,
    has_real_actions: false,
    execution_time: execution.execution_time || 0
  };

  if (execution.results) {
    execution.results.forEach(result => {
      if (result.success !== false) {
        analysis.successful_steps++;
      } else {
        analysis.failed_steps++;
      }

      // Check if this was a real integration step
      if (result.integration_used) {
        analysis.integration_steps++;
        analysis.has_real_actions = true;
      }
    });
  }

  analysis.success_rate = analysis.total_steps > 0 ? 
    (analysis.successful_steps / analysis.total_steps) * 100 : 0;

  return analysis;
}

function generateRecommendations(analysis) {
  const recommendations = [];

  if (analysis.success_rate === 100) {
    recommendations.push('✅ Workflow executed successfully - ready for production');
  } else if (analysis.success_rate >= 80) {
    recommendations.push('⚠️ Mostly successful - review failed steps');
  } else {
    recommendations.push('❌ Multiple failures - check integration setup');
  }

  if (analysis.has_real_actions) {
    recommendations.push('🔗 Real integrations detected - system is performing actual actions');
  } else {
    recommendations.push('📝 No real actions detected - may be generating templates only');
  }

  if (analysis.execution_time > 10000) {
    recommendations.push('⏱️ Slow execution time - consider optimizing integration calls');
  }

  if (analysis.integration_steps === 0) {
    recommendations.push('🔧 No integration steps found - add collect_credentials and execute_action steps');
  }

  return recommendations;
}

export default router;