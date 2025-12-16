import React, { useState } from 'react';
import { Bot, Zap, Github, ExternalLink } from 'lucide-react';
import { PromptInput } from './components/PromptInput';
import { WorkflowTimeline } from './components/WorkflowTimeline';
import { OutputPanel } from './components/OutputPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useWorkflow } from './hooks/useWorkflow';

function App() {
  const {
    isLoading,
    isGenerating,
    isExecuting,
    error,
    workflow,
    runWorkflow,
    clearError,
    reset
  } = useWorkflow();

  const [currentStep, setCurrentStep] = useState(0);

  const handleSubmit = async (prompt: string) => {
    try {
      clearError();
      setCurrentStep(0);
      
      const result = await runWorkflow(prompt);
      console.log('Workflow completed:', result);
    } catch (error) {
      console.error('Workflow failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NodeLess AI
            </h1>
          </div>
          
          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Describe any automation in natural language, and AI will plan and execute it automatically
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Powered by Gemini AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span>Open Source</span>
            </div>
          </div>
        </header>

        <main className="space-y-8">
          <section>
            <PromptInput 
              onSubmit={handleSubmit}
              isLoading={isLoading}
              disabled={isLoading}
            />
          </section>

          {error && (
            <section>
              <div className="max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <ExternalLink className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-red-800 font-medium mb-1">Error occurred</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                      <button
                        onClick={() => { clearError(); reset(); }}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {isGenerating && (
            <section>
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                  <LoadingSpinner 
                    size="lg" 
                    text="Generating workflow with Gemini AI..." 
                    className="flex-col gap-4"
                  />
                </div>
              </div>
            </section>
          )}

          {workflow && (
            <section>
              <WorkflowTimeline
                steps={workflow.workflow.workflow}
                results={workflow.execution.results}
                isExecuting={isExecuting}
                currentStep={currentStep}
              />
            </section>
          )}

          {workflow && !isLoading && (
            <section>
              <OutputPanel 
                execution={workflow.execution}
                isLoading={isLoading}
              />
            </section>
          )}
        </main>

        <footer className="mt-16 text-center text-gray-400 text-sm">
          <p>
            Built with React, TypeScript, and Gemini AI • 
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ml-1 hover:text-gray-600 underline"
            >
              View Source
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App
