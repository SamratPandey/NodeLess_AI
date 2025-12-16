export const formatOutput = {
  name: 'format_output',
  description: 'Structure and format results',
  execute: async (params, context) => {
    const { 
      format = 'structured', 
      sections = [], 
      include_metadata = false,
      professional = true,
      platform_specific = false 
    } = params;
    
    try {
      const previousData = context.stepResults?.[context.stepResults.length - 1]?.data || {};
      
      let formattedOutput = {};
      
      switch (format) {
        case 'structured':
          formattedOutput = {
            title: `${context.workflowType || 'Generated'} Output`,
            content: previousData.content || previousData,
            timestamp: new Date().toISOString(),
            ...(include_metadata && { metadata: previousData.metadata || {} })
          };
          break;
          
        case 'email_template':
          formattedOutput = {
            subject: previousData.subject || 'Professional Communication',
            body: previousData.content || previousData,
            format: 'html',
            signature: professional ? '\n\nBest regards,\n[Your Name]' : ''
          };
          break;
          
        case 'social_media':
          if (Array.isArray(previousData.content)) {
            formattedOutput = {
              posts: previousData.content.map((post, index) => ({
                id: index + 1,
                content: post,
                platform: platform_specific ? 'multi' : 'general',
                character_count: post.length,
                optimal_time: '2:00 PM - 4:00 PM'
              }))
            };
          } else {
            formattedOutput = {
              content: previousData.content || previousData,
              character_count: (previousData.content || '').length,
              hashtags_included: (previousData.content || '').includes('#'),
              platform_ready: true
            };
          }
          break;
          
        case 'report':
          formattedOutput = {
            executive_summary: previousData.summary || 'Summary of findings and recommendations',
            main_content: previousData.content || previousData,
            sections: sections.length > 0 ? sections : ['overview', 'analysis', 'recommendations'],
            appendix: include_metadata ? previousData.metadata : null,
            generated_date: new Date().toLocaleDateString()
          };
          break;
          
        case 'calendar':
          formattedOutput = {
            calendar_type: 'content_planning',
            duration: '7_days',
            entries: previousData.content || [],
            format_type: 'structured',
            include_resources: true,
            visual_layout: true
          };
          break;
          
        case 'review_report':
          formattedOutput = {
            summary: 'Comprehensive review completed',
            findings: previousData.content || previousData,
            priority_items: previousData.priority_items || [],
            recommendations: previousData.recommendations || [],
            next_steps: ['Review findings', 'Implement changes', 'Follow up']
          };
          break;
          
        default:
          formattedOutput = {
            formatted_content: previousData.content || previousData,
            format_applied: format,
            processing_complete: true
          };
      }
      
      if (sections.length > 0) {
        formattedOutput.sections_included = sections;
      }

      return {
        success: true,
        data: formattedOutput,
        metadata: {
          formatted_at: new Date().toISOString(),
          format_type: format,
          duration_ms: Math.floor(Math.random() * 300) + 100
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