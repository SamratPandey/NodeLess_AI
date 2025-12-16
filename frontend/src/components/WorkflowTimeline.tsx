import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Loader2, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import type { WorkflowStep, ExecutionResult } from '../types/workflow';

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  results?: ExecutionResult[];
  isExecuting?: boolean;
  currentStep?: number;
}

const getStepIcon = (step: WorkflowStep, result?: ExecutionResult, isActive?: boolean) => {
  if (result?.success) {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  }
  
  if (result && !result.success) {
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }
  
  if (isActive) {
    return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
  }
  
  const iconMap: Record<string, React.ReactNode> = {
    analyze_input: <Zap className="h-5 w-5 text-purple-500" />,
    generate_content: <Zap className="h-5 w-5 text-blue-500" />,
    format_output: <Zap className="h-5 w-5 text-indigo-500" />,
    send_output: <Zap className="h-5 w-5 text-green-500" />,
    extract_data: <Zap className="h-5 w-5 text-orange-500" />,
    summarize_content: <Zap className="h-5 w-5 text-yellow-500" />,
    validate_data: <Zap className="h-5 w-5 text-red-500" />,
    transform_data: <Zap className="h-5 w-5 text-cyan-500" />,
  };
  
  return iconMap[step.action] || <Clock className="h-5 w-5 text-gray-400" />;
};

const getStepStatus = (step: WorkflowStep, result?: ExecutionResult, isActive?: boolean) => {
  if (result?.success) return 'completed';
  if (result && !result.success) return 'failed';
  if (isActive) return 'running';
  return 'pending';
};

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  steps,
  results = [],
  isExecuting = false,
  currentStep = 0
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Workflow Execution</h3>
          <p className="text-sm text-gray-500 mt-1">
            {steps.length} steps • {isExecuting ? 'Running...' : 'Ready to execute'}
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {steps.map((step, index) => {
              const result = results.find(r => r.step_number === step.step);
              const isActive = isExecuting && currentStep === index + 1;
              const status = getStepStatus(step, result, isActive);
              
              return (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={clsx(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200",
                      {
                        'bg-green-50 border-green-200': status === 'completed',
                        'bg-red-50 border-red-200': status === 'failed',
                        'bg-blue-50 border-blue-200': status === 'running',
                        'bg-gray-50 border-gray-200': status === 'pending',
                      }
                    )}>
                      {getStepIcon(step, result, isActive)}
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={clsx(
                        "mt-2 h-8 w-px transition-colors duration-200",
                        {
                          'bg-green-200': status === 'completed',
                          'bg-red-200': status === 'failed', 
                          'bg-blue-200': status === 'running',
                          'bg-gray-200': status === 'pending',
                        }
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={clsx(
                          "text-sm font-medium transition-colors duration-200",
                          {
                            'text-green-700': status === 'completed',
                            'text-red-700': status === 'failed',
                            'text-blue-700': status === 'running', 
                            'text-gray-700': status === 'pending',
                          }
                        )}>
                          Step {step.step}: {step.action.replace('_', ' ').toUpperCase()}
                        </h4>
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {step.description}
                        </p>
                        
                        {result && (
                          <div className="mt-2 text-xs">
                            {result.success ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed in {result.execution_time}ms
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md">
                                <AlertCircle className="h-3 w-3" />
                                Failed: {result.error}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <span className={clsx(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                          {
                            'bg-green-100 text-green-800': status === 'completed',
                            'bg-red-100 text-red-800': status === 'failed',
                            'bg-blue-100 text-blue-800': status === 'running',
                            'bg-gray-100 text-gray-800': status === 'pending',
                          }
                        )}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};