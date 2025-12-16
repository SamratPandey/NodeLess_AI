
export const sampleWorkflows = {
  socialMedia: {
    prompt: "Create engaging social media posts about AI automation with relevant hashtags",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "text",
            "analysis_depth": "basic",
            "focus": "content_requirements"
          },
          "description": "Analyze the social media content requirements"
        },
        {
          "step": 2,
          "action": "generate_content",
          "params": {
            "content_type": "social_posts",
            "platform": "multi",
            "tone": "engaging",
            "count": 3,
            "include_hashtags": true
          },
          "description": "Generate multiple social media posts with hashtags"
        },
        {
          "step": 3,
          "action": "format_output",
          "params": {
            "format": "structured",
            "include_metadata": true,
            "platform_specific": true
          },
          "description": "Format posts for different platforms"
        },
        {
          "step": 4,
          "action": "send_output",
          "params": {
            "delivery_method": "structured_response",
            "include_tips": true
          },
          "description": "Deliver formatted social media content"
        }
      ],
      "estimated_time": 20,
      "complexity": "medium"
    }
  },

  documentAnalysis: {
    prompt: "Summarize a technical document and generate actionable insights",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "document",
            "analysis_depth": "comprehensive",
            "focus": "technical_content"
          },
          "description": "Analyze the technical document structure and content"
        },
        {
          "step": 2,
          "action": "extract_data",
          "params": {
            "extraction_type": "key_points",
            "include_technical_details": true,
            "categorize": true
          },
          "description": "Extract key technical information and categorize"
        },
        {
          "step": 3,
          "action": "summarize_content",
          "params": {
            "summary_type": "executive",
            "length": "medium",
            "include_insights": true
          },
          "description": "Create executive summary with insights"
        },
        {
          "step": 4,
          "action": "generate_content",
          "params": {
            "content_type": "action_items",
            "priority_levels": true,
            "timeline_suggestions": true
          },
          "description": "Generate prioritized action items"
        },
        {
          "step": 5,
          "action": "format_output",
          "params": {
            "format": "report",
            "sections": ["summary", "insights", "actions"],
            "professional": true
          },
          "description": "Format as professional analysis report"
        },
        {
          "step": 6,
          "action": "send_output",
          "params": {
            "delivery_method": "comprehensive_report",
            "include_appendix": true
          },
          "description": "Deliver complete analysis report"
        }
      ],
      "estimated_time": 45,
      "complexity": "high"
    }
  },

  resumeReview: {
    prompt: "Analyze a resume and provide constructive feedback for improvement",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "resume",
            "analysis_depth": "detailed",
            "focus": "structure_and_content"
          },
          "description": "Analyze resume structure, content, and formatting"
        },
        {
          "step": 2,
          "action": "validate_data",
          "params": {
            "validation_type": "completeness",
            "check_formatting": true,
            "industry_standards": true
          },
          "description": "Validate against industry standards and best practices"
        },
        {
          "step": 3,
          "action": "generate_content",
          "params": {
            "content_type": "feedback",
            "feedback_style": "constructive",
            "include_examples": true,
            "priority_levels": true
          },
          "description": "Generate detailed constructive feedback"
        },
        {
          "step": 4,
          "action": "format_output",
          "params": {
            "format": "structured_feedback",
            "sections": ["strengths", "improvements", "suggestions"],
            "actionable": true
          },
          "description": "Format feedback in actionable structure"
        },
        {
          "step": 5,
          "action": "send_output",
          "params": {
            "delivery_method": "detailed_review",
            "include_score": true
          },
          "description": "Deliver comprehensive resume review"
        }
      ],
      "estimated_time": 30,
      "complexity": "medium"
    }
  },

  contentPlanning: {
    prompt: "Create a week-long content calendar for a tech startup",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "business_context",
            "analysis_depth": "strategic",
            "focus": "target_audience"
          },
          "description": "Analyze tech startup context and target audience"
        },
        {
          "step": 2,
          "action": "generate_content",
          "params": {
            "content_type": "content_calendar",
            "duration": "7_days",
            "variety": true,
            "platform_specific": true
          },
          "description": "Generate diverse content ideas for the week"
        },
        {
          "step": 3,
          "action": "format_output",
          "params": {
            "format": "calendar",
            "include_timing": true,
            "include_resources": true,
            "visual_layout": true
          },
          "description": "Format as visual content calendar"
        },
        {
          "step": 4,
          "action": "send_output",
          "params": {
            "delivery_method": "calendar_format",
            "include_templates": true
          },
          "description": "Deliver formatted content calendar with templates"
        }
      ],
      "estimated_time": 25,
      "complexity": "medium"
    }
  },

  emailDraft: {
    prompt: "Draft a professional email response to a client inquiry",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "email_context",
            "analysis_depth": "basic",
            "focus": "tone_and_requirements"
          },
          "description": "Analyze client inquiry and determine response requirements"
        },
        {
          "step": 2,
          "action": "generate_content",
          "params": {
            "content_type": "email",
            "tone": "professional",
            "length": "concise",
            "include_action_items": true
          },
          "description": "Generate professional email response"
        },
        {
          "step": 3,
          "action": "format_output",
          "params": {
            "format": "email_template",
            "include_subject": true,
            "professional_structure": true
          },
          "description": "Format as professional email template"
        },
        {
          "step": 4,
          "action": "send_output",
          "params": {
            "delivery_method": "email_template",
            "include_tips": true
          },
          "description": "Deliver formatted email template"
        }
      ],
      "estimated_time": 15,
      "complexity": "low"
    }
  },

  codeReview: {
    prompt: "Review code and provide improvement suggestions",
    workflow: {
      "workflow": [
        {
          "step": 1,
          "action": "analyze_input",
          "params": {
            "input_type": "code",
            "analysis_depth": "comprehensive",
            "focus": "quality_and_performance"
          },
          "description": "Analyze code structure and quality"
        },
        {
          "step": 2,
          "action": "validate_data",
          "params": {
            "validation_type": "code_standards",
            "check_security": true,
            "check_performance": true
          },
          "description": "Validate against coding standards and best practices"
        },
        {
          "step": 3,
          "action": "generate_content",
          "params": {
            "content_type": "code_feedback",
            "include_examples": true,
            "severity_levels": true
          },
          "description": "Generate detailed code review feedback"
        },
        {
          "step": 4,
          "action": "format_output",
          "params": {
            "format": "review_report",
            "sections": ["issues", "suggestions", "best_practices"],
            "actionable": true
          },
          "description": "Format as structured code review report"
        },
        {
          "step": 5,
          "action": "send_output",
          "params": {
            "delivery_method": "detailed_report",
            "include_priority": true
          },
          "description": "Deliver comprehensive code review"
        }
      ],
      "estimated_time": 35,
      "complexity": "high"
    }
  }
};

export const workflowTemplates = {
  simple: {
    "workflow": [
      {
        "step": 1,
        "action": "analyze_input",
        "params": { "input_type": "text", "analysis_depth": "basic" },
        "description": "Analyze user request"
      },
      {
        "step": 2,
        "action": "generate_content",
        "params": { "content_type": "response" },
        "description": "Generate appropriate response"
      },
      {
        "step": 3,
        "action": "send_output",
        "params": { "delivery_method": "direct" },
        "description": "Deliver results to user"
      }
    ],
    "estimated_time": 10,
    "complexity": "low"
  },

  comprehensive: {
    "workflow": [
      {
        "step": 1,
        "action": "analyze_input",
        "params": { "input_type": "complex", "analysis_depth": "comprehensive" },
        "description": "Comprehensive input analysis"
      },
      {
        "step": 2,
        "action": "extract_data",
        "params": { "extraction_type": "detailed" },
        "description": "Extract relevant data and information"
      },
      {
        "step": 3,
        "action": "generate_content",
        "params": { "content_type": "detailed_response" },
        "description": "Generate detailed content"
      },
      {
        "step": 4,
        "action": "validate_data",
        "params": { "validation_type": "quality_check" },
        "description": "Validate content quality"
      },
      {
        "step": 5,
        "action": "format_output",
        "params": { "format": "professional" },
        "description": "Format for professional presentation"
      },
      {
        "step": 6,
        "action": "send_output",
        "params": { "delivery_method": "comprehensive" },
        "description": "Deliver complete results"
      }
    ],
    "estimated_time": 60,
    "complexity": "high"
  }
};