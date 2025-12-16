import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const SAMPLE_PROMPTS = [
  "Create engaging social media posts about AI automation with hashtags",
  "Draft a professional email response to a client inquiry", 
  "Analyze a resume and provide constructive feedback",
  "Create a week-long content calendar for a tech startup",
  "Review code and provide improvement suggestions",
  "Summarize a technical document and generate actionable insights"
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isLoading = false,
  placeholder = "Describe the task you want to automate...",
  disabled = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [showSamples, setShowSamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && !disabled) {
      onSubmit(prompt.trim());
    }
  };

  const handleSampleSelect = (sample: string) => {
    setPrompt(sample);
    setShowSamples(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={4}
            className={clsx(
              "w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
              isLoading && "opacity-75"
            )}
            maxLength={2000}
          />
          
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || disabled}
            className={clsx(
              "absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
              prompt.trim() && !isLoading && !disabled
                ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setShowSamples(!showSamples)}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try sample prompts
          </button>
          
          <span className={clsx(
            "text-xs",
            prompt.length > 1800 ? "text-red-500" : "text-gray-400"
          )}>
            {prompt.length}/2000
          </span>
        </div>
      </form>

      {showSamples && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Sample Prompts</h4>
          <div className="grid gap-2">
            {SAMPLE_PROMPTS.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleSampleSelect(sample)}
                className="text-left p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};