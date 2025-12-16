import GeminiAgent from './geminiClient.js';
import { sampleWorkflows, workflowTemplates } from './workflowExamples.js';

const agent = new GeminiAgent();

export class WorkflowAgent {
  constructor() {
    this.geminiAgent = agent;
  }

  async generateWorkflow(userPrompt, options = {}) {
    return await this.geminiAgent.generateWorkflow(userPrompt, options);
  }

  getSampleWorkflows() {
    return sampleWorkflows;
  }

  getTemplates() {
    return workflowTemplates;
  }

  getStatus() {
    return {
      ...this.geminiAgent.getModelInfo(),
      samples_available: Object.keys(sampleWorkflows).length,
      templates_available: Object.keys(workflowTemplates).length
    };
  }

  
  async testWithSample(sampleName) {
    if (!sampleWorkflows[sampleName]) {
      throw new Error(`Sample workflow "${sampleName}" not found`);
    }

    const sample = sampleWorkflows[sampleName];
    try {
      const generated = await this.generateWorkflow(sample.prompt, { useCache: false });
      
      return {
        success: true,
        sample: sampleName,
        prompt: sample.prompt,
        generated: generated,
        expected: sample.workflow
      };
    } catch (error) {
      return {
        success: false,
        sample: sampleName,
        error: error.message
      };
    }
  }
}


export const workflowAgent = new WorkflowAgent();
export { GeminiAgent, sampleWorkflows, workflowTemplates };