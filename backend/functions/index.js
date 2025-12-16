import { analyzeInput } from './analyzeInput.js';
import { generateContent } from './generateContent.js';
import { formatOutput } from './formatOutput.js';
import { sendOutput } from './sendOutput.js';
import { extractData, summarizeContent, validateData, transformData } from './dataFunctions.js';
import { setupIntegration } from './setupIntegration.js';
import { executeAction } from './executeAction.js';
import { collectCredentials } from './collectCredentials.js';
import { manageIntegrations } from './manageIntegrations.js';

export const functionRegistry = {
  analyze_input: analyzeInput,
  generate_content: generateContent,
  format_output: formatOutput,
  send_output: sendOutput,
  extract_data: extractData,
  summarize_content: summarizeContent,
  validate_data: validateData,
  transform_data: transformData,
  setup_integration: setupIntegration,
  execute_action: executeAction,
  collect_credentials: collectCredentials,
  manage_integrations: manageIntegrations
};

export const getFunction = (actionName) => {
  return functionRegistry[actionName];
};

export const getAllFunctions = () => {
  return Object.keys(functionRegistry);
};

export const validateAction = (actionName) => {
  return functionRegistry.hasOwnProperty(actionName);
};