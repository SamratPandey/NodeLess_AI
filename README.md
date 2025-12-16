# NodeLess AI 🤖

> **Revolutionary AI-Powered Automation Platform**  
> Describe automation in natural language → AI performs real actions across services

NodeLess AI transforms how you handle automation. Simply tell the AI what you want to accomplish, and it will intelligently plan and execute **real integrations** across multiple platforms - from sending actual emails to posting on social media, uploading files to cloud storage, and managing databases.

## Key Features

- **Natural Language Processing** - Describe automation needs in plain English
- **Real Service Integrations** - Actual actions, not just templates
- **AI-Driven Workflow Planning** - Gemini AI creates optimal execution paths
- **Secure Credential Management** - OAuth, API keys, and SMTP authentication
- **Intelligent Fallback System** - Works even when AI services are overloaded
- **Modern Web Interface** - React-based dashboard for workflow management

## What Makes It Different

Unlike traditional automation tools that require complex setup, NodeLess AI understands your intent and handles everything:

```bash
# Instead of configuring complex workflows...
User: "Set up Gmail integration and send welcome email to john@example.com"

# NodeLess AI automatically:
#  Sets up Gmail authentication
#  Collects necessary credentials  
#  Sends actual email via Gmail API
#  Provides delivery confirmation
```

##  Supported Integrations

###  Email Services
- **Gmail** - OAuth 2.0 integration with Gmail API
- **SMTP** - Any SMTP server with authentication
- **SendGrid** - API-based email delivery

###  Social Media
- **Twitter** - Post tweets, replies, and media
- **Facebook** - Page posting and management
- **LinkedIn** - Professional updates and sharing

###  Cloud Storage
- **AWS S3** - File upload and management
- **Google Drive** - Document storage and sharing

###  Databases
- **MySQL** - Relational data operations
- **PostgreSQL** - Advanced SQL operations
- **MongoDB** - Document-based storage
- **Redis** - Caching and session management

###  Communication
- **Twilio** - SMS messaging and notifications

##  Installation

### Prerequisites
- **Node.js** v18 or later
- **pnpm** package manager
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Quick Start

1. **Clone the Repository**
   ```bash
   git clone https://github.com/SamratPandey/NodeLess_-AI.git
   cd NodeLess_-AI
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend && pnpm install
   
   # Frontend  
   cd ../frontend && pnpm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file in backend directory
   cd ../backend
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env 
   echo "GEMINI_MODEL=gemini-2.5-flash" >> .env
   echo "PORT=3001" >> .env
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm start
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3001
   - **Health Check**: http://localhost:3001/health

## Usage Examples

### Email Automation
```javascript
// Natural language input:
"Send a welcome email to new users with their account details"

// AI generates and executes:
// 1. Gmail credential setup
// 2. Email composition with personalization
// 3. Actual email delivery via Gmail API
// 4. Delivery confirmation tracking
```

### Social Media Management
```javascript
// Natural language input:
"Post daily updates to Twitter about our product launches"

// AI generates and executes:
// 1. Twitter API authentication
// 2. Content generation and optimization
// 3. Scheduled posting with hashtags
// 4. Engagement monitoring
```

### File Management
```javascript
// Natural language input:
"Upload weekly reports to AWS S3 and organize by date"

// AI generates and executes:
// 1. AWS S3 credential configuration
// 2. Automated file organization
// 3. Secure upload with proper permissions
// 4. File URL generation and sharing
```

##  API Reference

### Core Endpoints

#### Execute Workflow
```http
POST /api/workflow/run
Content-Type: application/json

{
  "prompt": "Your automation description here",
  "options": {
    "useCache": true,
    "cacheTTL": 3600
  }
}
```

#### Test Integrations
```http
POST /api/integrations/test-integration
Content-Type: application/json

{
  "scenario": "email",
  "provider": "gmail",
  "test_data": {
    "to": "test@example.com",
    "subject": "Test Email"
  }
}
```

#### Get Integration Capabilities
```http
GET /api/integrations/capabilities
```

### Response Format
```json
{
  "success": true,
  "workflow_id": "unique_workflow_id",
  "execution_id": "unique_execution_id", 
  "workflow": {
    "steps": [...],
    "estimated_time": 45,
    "complexity": "medium"
  },
  "execution": {
    "status": "completed",
    "results": [...],
    "execution_time": 1250
  }
}
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   AI Engine    │
│   (React)       │◄──►│   (Node.js)      │◄──►│   (Gemini)      │
│                 │    │                  │    │                 │
│ • User Interface│    │ • API Routes     │    │ • Workflow Gen  │
│ • Workflow View │    │ • Integration    │    │ • Smart Fallback│
│ • Result Display│    │ • Execution      │    │ • Pattern Match │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Integrations   │
                    │                  │
                    │ • Email Services │
                    │ • Social Media   │
                    │ • Cloud Storage  │
                    │ • Databases      │
                    │ • Communication  │
                    └──────────────────┘
```

## 🔧 Development

### Project Structure
```
NodeLess_-AI/
├── backend/
│   ├── agent/           # AI workflow generation
│   ├── functions/       # Integration functions
│   ├── executor/        # Workflow execution engine
│   ├── routes/          # API endpoints
│   └── db/              # Database helpers
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── types/       # TypeScript definitions
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
└── docs/                # Documentation
```

### Adding New Integrations

1. **Create Integration Function**
   ```javascript
   // backend/functions/newService.js
   export const newServiceIntegration = {
     name: 'new_service_integration',
     execute: async (params, context) => {
       // Integration logic here
     }
   };
   ```

2. **Register Function**
   ```javascript
   // backend/functions/index.js
   import { newServiceIntegration } from './newService.js';
   
   export const functionRegistry = {
     // ... existing functions
     new_service_integration: newServiceIntegration
   };
   ```

3. **Update AI Prompts**
   ```javascript
   // backend/agent/geminiClient.js
   // Add service to system prompt and fallback logic
   ```

### Running Tests
```bash
# Backend integration tests
cd backend && node test-integrations.js

# Frontend component tests  
cd frontend && npm run test

# End-to-end tests
npm run test:e2e
```

##  Environment Configuration

### Required Environment Variables
```bash
# Backend (.env)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
PORT=3001
NODE_ENV=development

# Optional: Service-specific credentials
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
TWITTER_API_KEY=your_twitter_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key
```

### Development vs Production
```bash
# Development
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Production  
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
```

##  Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- **Google Gemini AI** for powering intelligent workflow generation
- **React Team** for the excellent frontend framework
- **Node.js Community** for the robust backend ecosystem
- **All Contributors** who help make NodeLess AI better

##  Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [docs/](docs/)
- **API Reference**: [API.md](docs/API.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

**Made with by the NodeLess AI Team**

*Revolutionizing automation through AI-powered natural language processing*
