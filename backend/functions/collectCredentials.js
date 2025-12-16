export const collectCredentials = {
  name: 'collect_credentials',
  description: 'Collect and manage credentials for service integrations',
  execute: async (params, context) => {
    const { 
      service_type = 'email',
      provider = 'gmail',
      credential_type = 'oauth',
      existing_integration = null
    } = params;
    
    try {
      const credentialConfig = generateCredentialConfig(service_type, provider, credential_type);
      
      return {
        success: true,
        data: {
          service_type,
          provider,
          credential_type,
          config: credentialConfig,
          setup_instructions: generateSetupInstructions(service_type, provider, credential_type),
          security_note: "Credentials will be securely stored and encrypted",
          next_steps: generateNextSteps(service_type, provider)
        },
        metadata: {
          requires_user_input: credentialConfig.requires_user_input,
          setup_complexity: credentialConfig.complexity,
          estimated_time: credentialConfig.estimated_time
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {
          service_type,
          provider,
          credential_type,
          status: 'failed'
        }
      };
    }
  }
};

function generateCredentialConfig(serviceType, provider, credentialType) {
  const configs = {
    email: {
      gmail: {
        oauth: {
          fields: [
            { name: 'client_id', type: 'text', label: 'Google Client ID', required: true },
            { name: 'client_secret', type: 'password', label: 'Google Client Secret', required: true },
            { name: 'redirect_uri', type: 'text', label: 'Redirect URI', required: true, default: 'http://localhost:3000/auth/callback' }
          ],
          auth_flow: 'oauth2',
          scopes: ['https://www.googleapis.com/auth/gmail.send'],
          requires_user_input: true,
          complexity: 'medium',
          estimated_time: '5-10 minutes'
        },
        smtp: {
          fields: [
            { name: 'email', type: 'email', label: 'Gmail Address', required: true },
            { name: 'app_password', type: 'password', label: 'App Password', required: true },
            { name: 'smtp_host', type: 'text', label: 'SMTP Host', required: true, default: 'smtp.gmail.com' },
            { name: 'smtp_port', type: 'number', label: 'SMTP Port', required: true, default: 587 }
          ],
          auth_flow: 'basic',
          requires_user_input: true,
          complexity: 'low',
          estimated_time: '2-5 minutes'
        }
      },
      smtp: {
        basic: {
          fields: [
            { name: 'smtp_host', type: 'text', label: 'SMTP Server', required: true },
            { name: 'smtp_port', type: 'number', label: 'Port', required: true },
            { name: 'username', type: 'text', label: 'Username', required: true },
            { name: 'password', type: 'password', label: 'Password', required: true },
            { name: 'secure', type: 'boolean', label: 'Use SSL/TLS', required: false, default: true }
          ],
          auth_flow: 'basic',
          requires_user_input: true,
          complexity: 'low',
          estimated_time: '1-3 minutes'
        }
      },
      sendgrid: {
        api_key: {
          fields: [
            { name: 'api_key', type: 'password', label: 'SendGrid API Key', required: true },
            { name: 'from_email', type: 'email', label: 'From Email', required: true },
            { name: 'from_name', type: 'text', label: 'From Name', required: false }
          ],
          auth_flow: 'api_key',
          requires_user_input: true,
          complexity: 'low',
          estimated_time: '1-2 minutes'
        }
      }
    },
    social: {
      twitter: {
        oauth: {
          fields: [
            { name: 'api_key', type: 'text', label: 'Twitter API Key', required: true },
            { name: 'api_secret', type: 'password', label: 'Twitter API Secret', required: true },
            { name: 'access_token', type: 'password', label: 'Access Token', required: true },
            { name: 'access_token_secret', type: 'password', label: 'Access Token Secret', required: true }
          ],
          auth_flow: 'oauth1',
          requires_user_input: true,
          complexity: 'high',
          estimated_time: '10-15 minutes'
        }
      },
      facebook: {
        oauth: {
          fields: [
            { name: 'app_id', type: 'text', label: 'Facebook App ID', required: true },
            { name: 'app_secret', type: 'password', label: 'Facebook App Secret', required: true },
            { name: 'page_access_token', type: 'password', label: 'Page Access Token', required: true }
          ],
          auth_flow: 'oauth2',
          requires_user_input: true,
          complexity: 'high',
          estimated_time: '10-20 minutes'
        }
      }
    },
    storage: {
      aws_s3: {
        access_key: {
          fields: [
            { name: 'access_key_id', type: 'text', label: 'AWS Access Key ID', required: true },
            { name: 'secret_access_key', type: 'password', label: 'AWS Secret Access Key', required: true },
            { name: 'region', type: 'select', label: 'AWS Region', required: true, options: ['us-east-1', 'us-west-2', 'eu-west-1'] },
            { name: 'bucket_name', type: 'text', label: 'S3 Bucket Name', required: true }
          ],
          auth_flow: 'api_key',
          requires_user_input: true,
          complexity: 'medium',
          estimated_time: '5-10 minutes'
        }
      }
    },
    database: {
      mysql: {
        connection: {
          fields: [
            { name: 'host', type: 'text', label: 'Database Host', required: true },
            { name: 'port', type: 'number', label: 'Port', required: true, default: 3306 },
            { name: 'username', type: 'text', label: 'Username', required: true },
            { name: 'password', type: 'password', label: 'Password', required: true },
            { name: 'database', type: 'text', label: 'Database Name', required: true }
          ],
          auth_flow: 'basic',
          requires_user_input: true,
          complexity: 'low',
          estimated_time: '2-5 minutes'
        }
      }
    },
    sms: {
      twilio: {
        api_key: {
          fields: [
            { name: 'account_sid', type: 'text', label: 'Twilio Account SID', required: true },
            { name: 'auth_token', type: 'password', label: 'Twilio Auth Token', required: true },
            { name: 'phone_number', type: 'tel', label: 'Twilio Phone Number', required: true }
          ],
          auth_flow: 'api_key',
          requires_user_input: true,
          complexity: 'low',
          estimated_time: '2-5 minutes'
        }
      }
    }
  };
  
  return configs[serviceType]?.[provider]?.[credentialType] || {
    fields: [],
    auth_flow: 'unknown',
    requires_user_input: true,
    complexity: 'unknown',
    estimated_time: 'unknown'
  };
}

function generateSetupInstructions(serviceType, provider, credentialType) {
  const instructions = {
    email: {
      gmail: {
        oauth: [
          "1. Go to Google Cloud Console (console.cloud.google.com)",
          "2. Create a new project or select existing one",
          "3. Enable Gmail API",
          "4. Go to 'Credentials' and create OAuth 2.0 client ID", 
          "5. Add redirect URI: http://localhost:3000/auth/callback",
          "6. Copy Client ID and Client Secret",
          "7. Complete OAuth flow when prompted"
        ],
        smtp: [
          "1. Enable 2-Factor Authentication on your Gmail account",
          "2. Go to Google Account settings",
          "3. Navigate to Security > App passwords",
          "4. Generate a new app password for 'Mail'",
          "5. Use this app password instead of your regular password"
        ]
      },
      sendgrid: [
        "1. Sign up for SendGrid account",
        "2. Go to Settings > API Keys",
        "3. Create new API key with 'Mail Send' permissions",
        "4. Copy the API key (it won't be shown again)",
        "5. Verify your sender email address"
      ]
    },
    social: {
      twitter: [
        "1. Apply for Twitter Developer account",
        "2. Create a new Twitter App",
        "3. Generate API keys and access tokens",
        "4. Make sure your app has read/write permissions"
      ]
    }
  };
  
  return instructions[serviceType]?.[provider]?.[credentialType] || [
    "1. Visit the service provider's developer documentation",
    "2. Create developer account if needed",
    "3. Generate required API credentials",
    "4. Configure authentication settings"
  ];
}

function generateNextSteps(serviceType, provider) {
  return [
    "1. Enter your credentials in the form below",
    "2. Test the connection to verify setup",
    "3. Save the integration for future use",
    "4. Start using the integration in your workflows"
  ];
}