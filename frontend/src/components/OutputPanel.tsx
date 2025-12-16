import React, { useState } from 'react';
import { Copy, Download, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import type { WorkflowExecution } from '../types/workflow';

interface OutputPanelProps {
  execution: WorkflowExecution | null;
  isLoading?: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  execution,
  isLoading = false
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper function to extract actual content from nested data structures
  const extractDisplayContent = (data: any): string => {
    if (typeof data === 'string') return data;
    
    // Handle integration results (new format)
    if (data.action_type && data.service_provider) {
      return formatIntegrationResult(data);
    }
    
    // Extract content from send_output final result structure
    if (data.result?.content?.content) return data.result.content.content;
    if (data.result?.content?.formatted_content) return data.result.content.formatted_content;
    if (data.result?.content) {
      // Handle nested integration results in send_output
      if (typeof data.result.content === 'object' && data.result.content.action_type) {
        return formatIntegrationResult(data.result.content);
      }
      return JSON.stringify(data.result.content, null, 2);
    }
    
    // Extract content from generate_content structure  
    if (data.content) return data.content;
    
    // Extract content from format_output structure
    if (data.formatted_content) return data.formatted_content;

    // Handle credential collection results
    if (data.service_type && data.provider && data.config) {
      return formatCredentialResult(data);
    }
    
    return JSON.stringify(data, null, 2);
  };

  const formatIntegrationResult = (data: any): string => {
    const lines = [];
    
    lines.push(`🔗 ${data.service_provider?.toUpperCase() || 'SERVICE'} INTEGRATION`);
    lines.push(`Action: ${data.action_type?.replace(/_/g, ' ')?.toUpperCase() || 'Unknown'}`);
    lines.push(`Status: ${data.status?.toUpperCase() || 'Unknown'}`);
    lines.push('');

    if (data.result) {
      const result = data.result;
      
      // Email results
      if (data.action_type === 'send_email') {
        lines.push(`📧 EMAIL SENT SUCCESSFULLY`);
        lines.push(`To: ${result.to || 'Unknown recipient'}`);
        lines.push(`Subject: ${result.subject || 'No subject'}`);
        lines.push(`Provider: ${result.provider || 'Unknown'}`);
        lines.push(`Message ID: ${result.message_id || 'N/A'}`);
        lines.push(`Sent: ${result.sent_at || 'Unknown time'}`);
        if (result.note) lines.push(`Note: ${result.note}`);
      }
      
      // Social media results
      else if (data.action_type === 'post_social') {
        lines.push(`📱 POST PUBLISHED SUCCESSFULLY`);
        lines.push(`Content: "${result.content || 'No content'}"`);
        lines.push(`Platform: ${result.provider || 'Unknown'}`);
        lines.push(`Post ID: ${result.post_id || 'N/A'}`);
        lines.push(`Posted: ${result.posted_at || 'Unknown time'}`);
        if (result.hashtags?.length) {
          lines.push(`Hashtags: ${result.hashtags.join(', ')}`);
        }
        if (result.note) lines.push(`Note: ${result.note}`);
      }
      
      // File upload results
      else if (data.action_type === 'upload_file') {
        lines.push(`📁 FILE UPLOADED SUCCESSFULLY`);
        lines.push(`Bucket: ${result.bucket || 'Unknown'}`);
        lines.push(`File: ${result.key || result.filename || 'Unknown'}`);
        if (result.url) lines.push(`URL: ${result.url}`);
        lines.push(`Provider: ${result.provider || 'Unknown'}`);
        lines.push(`Uploaded: ${result.uploaded_at || 'Unknown time'}`);
        if (result.note) lines.push(`Note: ${result.note}`);
      }
      
      // Generic result
      else {
        lines.push(`✅ ACTION COMPLETED`);
        Object.entries(result).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            lines.push(`${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`);
          }
        });
      }
    }
    
    lines.push('');
    lines.push(`Executed: ${data.executed_at || 'Unknown time'}`);
    
    return lines.join('\n');
  };

  const formatCredentialResult = (data: any): string => {
    const lines = [];
    
    lines.push(`🔐 CREDENTIAL SETUP - ${data.provider?.toUpperCase() || 'PROVIDER'}`);
    lines.push(`Service: ${data.service_type?.replace(/_/g, ' ')?.toUpperCase() || 'Unknown'}`);
    lines.push(`Auth Type: ${data.credential_type?.toUpperCase() || 'Unknown'}`);
    lines.push('');
    
    if (data.config) {
      const config = data.config;
      lines.push(`⚙️ CONFIGURATION REQUIREMENTS:`);
      lines.push(`Complexity: ${config.complexity || 'Unknown'}`);
      lines.push(`Estimated Time: ${config.estimated_time || 'Unknown'}`);
      lines.push(`Auth Flow: ${config.auth_flow || 'Unknown'}`);
      lines.push('');
      
      if (config.fields?.length) {
        lines.push(`📝 REQUIRED FIELDS:`);
        config.fields.forEach((field: any, index: number) => {
          lines.push(`${index + 1}. ${field.label || field.name} ${field.required ? '(Required)' : '(Optional)'}`);
        });
        lines.push('');
      }
    }
    
    if (data.setup_instructions?.length) {
      lines.push(`📋 SETUP INSTRUCTIONS:`);
      data.setup_instructions.forEach((instruction: string, index: number) => {
        lines.push(`${index + 1}. ${instruction}`);
      });
      lines.push('');
    }
    
    if (data.security_note) {
      lines.push(`🔒 SECURITY: ${data.security_note}`);
    }
    
    return lines.join('\n');
  };

  const renderResultData = (data: any, title: string, section: string) => {
    if (!data) return null;

    const displayContent = extractDisplayContent(data);
    const content = displayContent;

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(content, section)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Copy to clipboard"
            >
              {copiedSection === section ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => handleDownload(content, `${title.toLowerCase().replace(/\s+/g, '_')}.txt`)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {/* Always display content as formatted text */}
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed font-mono">
            {displayContent}
          </div>
          
          {data.metadata && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                {Object.entries(data.metadata).map(([key, value]) => (
                  <div key={`metadata-${key}`} className="flex justify-between">
                    <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Processing...</h3>
          </div>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <div className="px-6 py-12 text-center">
            <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Results Yet</h3>
            <p className="text-gray-400">
              Enter a prompt above to start generating and executing workflows
            </p>
          </div>
        </div>
      </div>
    );
  }

  const finalResult = execution.results?.[execution.results.length - 1];
  const hasError = !execution.success || execution.results?.some(r => !r.success);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">Workflow Results</h3>
              {hasError ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Success
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              Execution time: {execution.execution_time}ms
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {execution.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Execution Error</span>
              </div>
              <p className="text-red-600 text-sm">{execution.error}</p>
            </div>
          )}

          {finalResult?.data && renderResultData(
            finalResult.data, 
            'Final Output', 
            'final'
          )}

          {execution.results && execution.results.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
                Step-by-Step Results
              </h4>
              
              {execution.results.slice(0, -1).map((result, index) => (
                <React.Fragment key={`step-${result.step_number || index}`}>
                  {result.data && renderResultData(
                    result.data,
                    `Step ${result.step_number}: ${result.action_name}`,
                    `step-${index}`
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};