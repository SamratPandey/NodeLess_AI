export const setupEmail = {
  name: 'setup_email',
  description: 'Setup email configuration for sending emails',
  execute: async (params, context) => {
    const { 
      email_provider = 'gmail',
      smtp_host = null,
      smtp_port = null
    } = params;
    
    try {
      const config = {
        provider: email_provider,
        requires_credentials: true,
        credential_fields: []
      };

      // Define required credentials based on provider
      switch (email_provider.toLowerCase()) {
        case 'gmail':
          config.smtp_host = 'smtp.gmail.com';
          config.smtp_port = 587;
          config.credential_fields = [
            { name: 'email', label: 'Gmail Address', type: 'email', required: true },
            { name: 'password', label: 'App Password', type: 'password', required: true, 
              help: 'Use Gmail App Password, not your regular password' }
          ];
          break;
          
        case 'outlook':
          config.smtp_host = 'smtp.live.com';
          config.smtp_port = 587;
          config.credential_fields = [
            { name: 'email', label: 'Outlook Email', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true }
          ];
          break;
          
        case 'custom':
          config.smtp_host = smtp_host;
          config.smtp_port = smtp_port;
          config.credential_fields = [
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'password', label: 'Password', type: 'password', required: true },
            { name: 'smtp_host', label: 'SMTP Host', type: 'text', value: smtp_host },
            { name: 'smtp_port', label: 'SMTP Port', type: 'number', value: smtp_port }
          ];
          break;
          
        default:
          throw new Error(`Unsupported email provider: ${email_provider}`);
      }

      return {
        success: true,
        data: {
          setup_status: 'credentials_required',
          provider: email_provider,
          next_step: 'collect_credentials',
          credential_form: config.credential_fields,
          instructions: `Please provide your ${email_provider} credentials to enable email sending.`
        },
        metadata: {
          setup_at: new Date().toISOString(),
          provider: email_provider
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }
};