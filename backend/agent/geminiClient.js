import { GoogleGenAI } from "@google/genai";
import { dbHelpers } from "../db/index.js";
import crypto from "crypto";

class GeminiAgent {
  constructor() {
    this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.systemPrompt = `You are an AI workflow planner for NodeLess AI - a system that performs REAL ACTIONS, not just templates.

CRITICAL: When users ask to "send emails", "post to social media", or integrate with services, create workflows that ACTUALLY PERFORM these actions using real service integrations.

INSTRUCTIONS:
1. Convert user intent into executable workflows that perform REAL actions
2. For service integrations, use collect_credentials → execute_action pattern
3. Return ONLY valid JSON, no explanations or markdown
4. Each step must have: step number, action, and parameters
5. Maximum 7 steps per workflow
6. Focus on real automation and service integration

AVAILABLE ACTIONS:

CONTENT & ANALYSIS:
- analyze_input: Analyze and understand user input
- generate_content: Create text, posts, documents, code  
- format_output: Structure and format results
- send_output: Deliver final results to user
- extract_data: Pull information from sources
- summarize_content: Create summaries and key points
- validate_data: Check data quality and accuracy
- transform_data: Convert data between formats

REAL INTEGRATIONS (USE THESE FOR ACTUAL ACTIONS):
- collect_credentials: Set up authentication for services (Gmail, Twitter, etc.)
- execute_action: Perform real actions (send emails, post to social media, upload files)
- manage_integrations: Create, test, and manage service connections
- setup_integration: Configure third-party service integrations

INTEGRATION WORKFLOW PATTERNS:

EMAIL WORKFLOW:
1. analyze_input → 2. collect_credentials (email service) → 3. execute_action (send_email) → 4. send_output

SOCIAL MEDIA WORKFLOW:  
1. analyze_input → 2. collect_credentials (social platform) → 3. execute_action (post_social) → 4. send_output

FILE STORAGE WORKFLOW:
1. analyze_input → 2. collect_credentials (cloud storage) → 3. execute_action (upload_file) → 4. send_output

PARAMETERS FOR REAL ACTIONS:

collect_credentials:
- service_type: "email" | "social" | "storage" | "database" | "sms"
- provider: "gmail" | "twitter" | "facebook" | "aws_s3" | "twilio" etc.
- credential_type: "oauth" | "api_key" | "smtp" | "basic"

execute_action:
- action_type: "send_email" | "post_social" | "upload_file" | "store_data" | "send_sms" | "make_api_call"
- service_provider: specific provider name
- action_data: { to, subject, body } for email | { content, hashtags } for social etc.
- credentials: {} (collected from previous step)

manage_integrations:
- action: "create" | "test" | "list" | "delete" | "update"
- service_type: service category
- provider: specific provider
- integration_name: descriptive name

OUTPUT FORMAT (JSON ONLY):
{
  "workflow": [
    {
      "step": 1,
      "action": "analyze_input",
      "params": {
        "input_type": "text",
        "analysis_depth": "basic"
      },
      "description": "Analyze the user's request"
    }
  ],
  "estimated_time": 15,
  "complexity": "medium"
}

USER PROMPT: `;
  }

  async generateWorkflow(userPrompt, options = {}) {
    try {
      const cacheKey = this.generateCacheKey(userPrompt, options);


      if (options.useCache !== false) {
        const cachedResult = await dbHelpers.getCacheValue(cacheKey);
        if (cachedResult) {
          console.log("🎯 Workflow retrieved from cache");
          return cachedResult;
        }
      }


      if (
        !userPrompt ||
        typeof userPrompt !== "string" ||
        userPrompt.trim().length === 0
      ) {
        throw new Error(
          "User prompt is required and must be a non-empty string"
        );
      }

      if (userPrompt.length > 2000) {
        throw new Error(
          "User prompt is too long. Maximum 2000 characters allowed."
        );
      }
      const fullPrompt = this.systemPrompt + userPrompt;

      console.log("Generating workflow with Gemini...");

      const result = await this.genAI.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
      });

      const text = result.text;


      const workflow = this.parseWorkflowResponse(text);

      if (options.useCache !== false) {
        const cacheTTL = options.cacheTTL || 86400; // 24 hours default
        await dbHelpers.setCacheValue(cacheKey, workflow, cacheTTL);
        console.log("Workflow cached for future use");
      }

      return workflow;
    } catch (error) {
      console.error("Gemini workflow generation error:", error);

      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Gemini API key");
      }

      if (error.message.includes("quota")) {
        throw new Error("Gemini API quota exceeded");
      }

      if (error.message.includes("JSON")) {
        throw new Error("Failed to parse workflow response. Please try again.");
      }

      // Fallback when Gemini is overloaded
      if (error.message.includes("overloaded") || error.message.includes("503") || error.message.includes("UNAVAILABLE")) {
        console.log("🔄 Gemini overloaded, using intelligent fallback...");
        return this.generateFallbackWorkflow(userPrompt);
      }

      throw new Error(`Workflow generation failed: ${error.message}`);
    }
  }

  generateFallbackWorkflow(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    
    // Email workflows
    if (prompt.includes('email') || prompt.includes('send') || prompt.includes('mail')) {
      return this.createEmailWorkflow(userPrompt);
    }
    
    // Social media workflows  
    if (prompt.includes('social') || prompt.includes('post') || prompt.includes('twitter') || prompt.includes('facebook')) {
      return this.createSocialWorkflow(userPrompt);
    }
    
    // File/storage workflows
    if (prompt.includes('upload') || prompt.includes('file') || prompt.includes('storage') || prompt.includes('s3')) {
      return this.createStorageWorkflow(userPrompt);
    }
    
    // Database workflows
    if (prompt.includes('database') || prompt.includes('store') || prompt.includes('mysql') || prompt.includes('data')) {
      return this.createDatabaseWorkflow(userPrompt);
    }
    
    // Default content generation workflow
    return this.createDefaultWorkflow(userPrompt);
  }

  createEmailWorkflow(userPrompt) {
    return {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: {
            input_type: "email_request",
            analysis_depth: "detailed"
          },
          description: "Analyze the email request and extract recipient, subject, and content details"
        },
        {
          step: 2,
          action: "collect_credentials",
          params: {
            service_type: "email",
            provider: "gmail",
            credential_type: "oauth"
          },
          description: "Set up Gmail authentication and collect necessary credentials"
        },
        {
          step: 3,
          action: "execute_action",
          params: {
            action_type: "send_email",
            service_provider: "gmail",
            action_data: this.extractEmailData(userPrompt)
          },
          description: "Send the actual email using Gmail integration"
        },
        {
          step: 4,
          action: "send_output",
          params: {
            delivery_method: "direct",
            format: "confirmation"
          },
          description: "Confirm email delivery and provide status report"
        }
      ],
      estimated_time: 45,
      complexity: "medium"
    };
  }

  createSocialWorkflow(userPrompt) {
    const prompt = userPrompt.toLowerCase();
    const provider = prompt.includes('twitter') ? 'twitter' : 
                    prompt.includes('facebook') ? 'facebook' : 'twitter';
    
    return {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: {
            input_type: "social_post",
            analysis_depth: "basic"
          },
          description: "Analyze the social media post request"
        },
        {
          step: 2,
          action: "collect_credentials", 
          params: {
            service_type: "social",
            provider: provider,
            credential_type: "oauth"
          },
          description: `Set up ${provider} authentication`
        },
        {
          step: 3,
          action: "execute_action",
          params: {
            action_type: "post_social",
            service_provider: provider,
            action_data: this.extractSocialData(userPrompt)
          },
          description: `Post content to ${provider}`
        },
        {
          step: 4,
          action: "send_output",
          params: {
            delivery_method: "direct"
          },
          description: "Confirm post was published successfully"
        }
      ],
      estimated_time: 30,
      complexity: "medium"
    };
  }

  createStorageWorkflow(userPrompt) {
    return {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: {
            input_type: "file_upload",
            analysis_depth: "basic"
          },
          description: "Analyze the file upload request"
        },
        {
          step: 2,
          action: "collect_credentials",
          params: {
            service_type: "storage", 
            provider: "aws_s3",
            credential_type: "access_key"
          },
          description: "Set up AWS S3 authentication"
        },
        {
          step: 3,
          action: "execute_action",
          params: {
            action_type: "upload_file",
            service_provider: "aws_s3",
            action_data: this.extractStorageData(userPrompt)
          },
          description: "Upload file to S3 bucket"
        },
        {
          step: 4,
          action: "send_output",
          params: {
            delivery_method: "direct"
          },
          description: "Confirm file upload completed"
        }
      ],
      estimated_time: 25,
      complexity: "low"
    };
  }

  createDatabaseWorkflow(userPrompt) {
    return {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: {
            input_type: "database_operation",
            analysis_depth: "detailed"
          },
          description: "Analyze the database operation request"
        },
        {
          step: 2,
          action: "collect_credentials",
          params: {
            service_type: "database",
            provider: "mysql", 
            credential_type: "connection"
          },
          description: "Set up database connection credentials"
        },
        {
          step: 3,
          action: "execute_action",
          params: {
            action_type: "store_data",
            service_provider: "mysql",
            action_data: this.extractDatabaseData(userPrompt)
          },
          description: "Store data in MySQL database"
        },
        {
          step: 4,
          action: "send_output",
          params: {
            delivery_method: "direct"
          },
          description: "Confirm data storage completed"
        }
      ],
      estimated_time: 35,
      complexity: "medium"
    };
  }

  createDefaultWorkflow(userPrompt) {
    return {
      workflow: [
        {
          step: 1,
          action: "analyze_input",
          params: {
            input_type: "text",
            analysis_depth: "basic"
          },
          description: "Analyze the user's request"
        },
        {
          step: 2,
          action: "generate_content",
          params: {
            content_type: "response",
            tone: "helpful"
          },
          description: "Generate helpful response content"
        },
        {
          step: 3,
          action: "send_output",
          params: {
            delivery_method: "direct"
          },
          description: "Deliver the generated content"
        }
      ],
      estimated_time: 15,
      complexity: "low"
    };
  }

  extractEmailData(prompt) {
    // Extract email details from prompt
    const emailMatch = prompt.match(/(?:to |send (?:to )?)([\w\.-]+@[\w\.-]+)/);
    const subjectMatch = prompt.match(/subject["\s]*["']([^"']+)["']/i) || 
                        prompt.match(/with subject\s+["']([^"']+)["']/i);
    const messageMatch = prompt.match(/message["\s]*["']([^"']+)["']/i) ||
                        prompt.match(/and message\s+["']([^"']+)["']/i);
    
    return {
      to: emailMatch ? emailMatch[1] : "recipient@example.com",
      subject: subjectMatch ? subjectMatch[1] : "Automated Message from NodeLess AI",
      body: messageMatch ? messageMatch[1] : "This is an automated message sent by NodeLess AI.",
      from: "noreply@nodelessai.com"
    };
  }

  extractSocialData(prompt) {
    // Extract social media content
    const contentMatch = prompt.match(/post["\s]*["']([^"']+)["']/i) ||
                        prompt.match(/saying["\s]*["']([^"']+)["']/i);
    
    return {
      content: contentMatch ? contentMatch[1] : "Hello from NodeLess AI! 🤖 Automated post via AI integration.",
      hashtags: ["#NodeLessAI", "#automation", "#ai"]
    };
  }

  extractStorageData(prompt) {
    const filenameMatch = prompt.match(/file["\s]*["']([^"']+)["']/i) ||
                         prompt.match(/upload["\s]*["']([^"']+)["']/i);
    const bucketMatch = prompt.match(/bucket["\s]*["']([^"']+)["']/i);
    
    return {
      filename: filenameMatch ? filenameMatch[1] : "document.txt",
      bucket: bucketMatch ? bucketMatch[1] : "default-bucket",
      folder: "uploads"
    };
  }

  extractDatabaseData(prompt) {
    const tableMatch = prompt.match(/table["\s]*["']([^"']+)["']/i);
    
    return {
      table: tableMatch ? tableMatch[1] : "data",
      key: "automated_entry",
      value: "Data inserted by NodeLess AI automation"
    };
  }


  parseWorkflowResponse(responseText) {
    try {
      let cleanText = responseText.trim();

      cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const workflow = JSON.parse(jsonMatch[0]);

      this.validateWorkflow(workflow);

      return workflow;
    } catch (error) {
      console.error("JSON parsing error:", error);
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
  }

  validateWorkflow(workflow) {
    if (!workflow || typeof workflow !== "object") {
      throw new Error("Workflow must be an object");
    }

    if (!Array.isArray(workflow.workflow)) {
      throw new Error('Workflow must contain a "workflow" array');
    }

    if (workflow.workflow.length === 0) {
      throw new Error("Workflow cannot be empty");
    }

    if (workflow.workflow.length > 10) {
      throw new Error("Workflow cannot have more than 10 steps");
    }
    
    const validActions = [
      "analyze_input",
      "generate_content",
      "format_output",
      "send_output",
      "extract_data",
      "summarize_content",
      "validate_data",
      "transform_data",
      "setup_integration",
      "execute_action",
      "collect_credentials",
      "manage_integrations"
    ];

    workflow.workflow.forEach((step, index) => {
      if (!step.step || typeof step.step !== "number") {
        throw new Error(`Step ${index + 1}: Missing or invalid step number`);
      }

      if (!step.action || !validActions.includes(step.action)) {
        throw new Error(`Step ${index + 1}: Invalid action "${step.action}"`);
      }

      if (!step.params || typeof step.params !== "object") {
        throw new Error(`Step ${index + 1}: Missing or invalid params`);
      }

      if (!step.description || typeof step.description !== "string") {
        throw new Error(`Step ${index + 1}: Missing or invalid description`);
      }
    });

    
    if (
      workflow.estimated_time &&
      (typeof workflow.estimated_time !== "number" ||
        workflow.estimated_time <= 0)
    ) {
      throw new Error("Estimated time must be a positive number");
    }

    
    // Normalize complexity if present
    if (workflow.complexity) {
      const complexityLower = workflow.complexity.toLowerCase();
      if (complexityLower.includes("low") || complexityLower.includes("simple") || complexityLower.includes("easy")) {
        workflow.complexity = "low";
      } else if (complexityLower.includes("high") || complexityLower.includes("complex") || complexityLower.includes("difficult")) {
        workflow.complexity = "high";
      } else {
        workflow.complexity = "medium";
      }
    } else {
      workflow.complexity = "medium";
    }
  }

  
  generateCacheKey(prompt, options = {}) {
    const cacheData = {
      prompt: prompt.trim().toLowerCase(),
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash-exp",
      options: options,
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(cacheData))
      .digest("hex");
  }

  
  getModelInfo() {
    return {
      model: this.modelName,
      provider: "Google Gemini",
      status: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
    };
  }
}

export default GeminiAgent;
