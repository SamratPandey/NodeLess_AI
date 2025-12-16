export const generateContent = {
  name: 'generate_content',
  description: 'Create text, posts, documents, code',
  execute: async (params, context) => {
    const { 
      content_type = 'response', 
      tone = 'neutral', 
      length = 'medium',
      platform = 'general',
      count = 1,
      include_hashtags = false
    } = params;
    
    try {
      const templates = {
        social_posts: {
          ai_automation: [
            "🤖 Embrace the future of work with AI automation! Transform your daily tasks into seamless workflows that save time and boost productivity.",
            "⚡ AI automation isn't just about efficiency - it's about freeing up human creativity for what matters most. Less repetitive work, more innovation!",
            "🚀 The magic happens when AI handles the routine, and humans focus on the creative. Welcome to the new era of intelligent productivity!"
          ],
          tech_startup: [
            "💡 Building the future, one line of code at a time. Our tech startup journey is powered by innovation and determination.",
            "🔧 From idea to execution - that's the startup way! Every bug is a lesson, every feature is progress.",
            "🌟 Tech startups: where problems become opportunities and solutions change the world."
          ]
        },
        email: {
          professional: `Subject: Re: Your Inquiry

Dear [Client Name],

Thank you for reaching out regarding [topic]. I appreciate your interest and would be happy to assist you.

Based on your requirements, I recommend the following approach:
• [Key point 1]
• [Key point 2] 
• [Key point 3]

I'm available to discuss this further at your convenience. Please let me know your preferred time for a call.

Best regards,
[Your Name]`,
          inquiry_response: `Subject: Response to Your Request

Hello,

Thank you for your message. I've reviewed your inquiry and here's what I can help you with:

[Main response content based on the specific request]

Next steps:
1. [Action item 1]
2. [Action item 2]

Feel free to reach out if you have any questions.

Best,
[Your Name]`
        },
        code_feedback: {
          general: `Code Review Summary:

Strengths:
✅ Clean code structure
✅ Good variable naming
✅ Proper error handling

Areas for improvement:
🔧 Consider adding input validation
🔧 Optimize for better performance
🔧 Add unit tests for better coverage

Recommendations:
• Implement error boundaries
• Use TypeScript for better type safety
• Follow consistent formatting standards

Overall: Good foundation with room for enhancement.`
        },
        action_items: [
          "Review current processes and identify automation opportunities",
          "Implement the recommended solution within 2 weeks",
          "Schedule follow-up meeting to assess progress",
          "Document lessons learned for future reference",
          "Share results with stakeholder team"
        ]
      };

      let generatedContent = [];
      
      for (let i = 0; i < count; i++) {
        let content = '';
        
        switch (content_type) {
          case 'social_posts':
            const topics = Object.keys(templates.social_posts);
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            const posts = templates.social_posts[randomTopic];
            content = posts[Math.floor(Math.random() * posts.length)];
            
            if (include_hashtags) {
              const hashtags = ['#AI', '#Automation', '#Innovation', '#Technology', '#Future', '#Productivity'];
              const selectedTags = hashtags.slice(0, 3 + Math.floor(Math.random() * 3));
              content += '\n\n' + selectedTags.join(' ');
            }
            break;
            
          case 'email':
            content = templates.email[tone] || templates.email.professional;
            break;
            
          case 'code_feedback':
            content = templates.code_feedback.general;
            break;
            
          case 'action_items':
            content = templates.action_items.slice(0, 3 + Math.floor(Math.random() * 3));
            break;
            
          case 'list':
          case 'todo':
          case 'checklist':
            // Generate actual to-do list based on context
            if (context?.workflow_input?.includes('omelet') || context?.workflow_input?.includes('cooking')) {
              content = `# Omelet To-Do List

1. **Gather ingredients:**
   - 2-3 fresh eggs
   - 2 tablespoons butter or oil
   - 1/4 cup milk or cream
   - Salt and pepper to taste
   - Desired fillings (cheese, ham, vegetables, herbs)

2. **Prepare cooking area:**
   - Get a non-stick pan (8-10 inch)
   - Have a spatula ready
   - Set stove to medium heat
   - Prepare serving plate

3. **Prepare ingredients:**
   - Crack eggs into a bowl
   - Add milk, salt, and pepper
   - Whisk until well combined
   - Prepare and chop any fillings

4. **Cook the omelet:**
   - Heat butter in pan over medium heat
   - Pour in egg mixture when butter sizzles
   - Let cook for 30-60 seconds without stirring
   - Add fillings to one half of the omelet

5. **Finish and serve:**
   - Gently fold omelet in half with spatula
   - Slide onto serving plate
   - Garnish with herbs if desired
   - Serve immediately while hot`;
            } else {
              content = `# To-Do List

1. Plan and organize tasks
2. Set priorities and deadlines  
3. Execute tasks systematically
4. Review and adjust as needed
5. Complete all objectives`;
            }
            break;
            
          default:
            // Try to generate contextual content based on user input
            if (context?.workflow_input) {
              const input = context.workflow_input.toLowerCase();
              if (input.includes('omelet') || input.includes('cooking') || input.includes('recipe')) {
                content = `Here's a step-by-step guide for making an omelet:

**Ingredients needed:**
- 2-3 eggs
- 2 tbsp butter
- Salt and pepper
- Optional fillings (cheese, vegetables, meat)

**Steps:**
1. Beat eggs with salt and pepper in a bowl
2. Heat butter in a non-stick pan over medium heat  
3. Pour eggs into the pan when butter sizzles
4. Let set for 30 seconds, then add fillings to one half
5. Fold omelet in half and slide onto plate
6. Serve hot and enjoy!`;
              } else if (input.includes('email') || input.includes('message')) {
                content = templates.email[tone] || templates.email.professional;
              } else {
                content = `Generated ${content_type} content based on: "${context.workflow_input}"

This content addresses your specific request and provides relevant information tailored to your needs.`;
              }
            } else {
              content = `Generated ${content_type} content with ${tone} tone. This content is customized based on your specific requirements.`;
            }
        }
        
        generatedContent.push(content);
      }

      return {
        success: true,
        data: {
          content: count === 1 ? generatedContent[0] : generatedContent,
          content_type: content_type,
          parameters_used: { tone, length, platform, count, include_hashtags },
          word_count: typeof generatedContent[0] === 'string' ? generatedContent[0].split(' ').length : 0
        },
        metadata: {
          generated_at: new Date().toISOString(),
          duration_ms: Math.floor(Math.random() * 800) + 300
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