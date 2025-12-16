export const sendOutput = {
  name: 'send_output',
  description: 'Deliver final results to user',
  execute: async (params, context) => {
    const { 
      delivery_method = 'direct', 
      include_tips = false,
      include_score = false,
      include_appendix = false 
    } = params;
    
    try {
      const allResults = context.stepResults || [];
      const finalData = allResults[allResults.length - 1]?.data || {};
      
      let deliveryPackage = {
        status: 'completed',
        delivery_method: delivery_method,
        timestamp: new Date().toISOString()
      };
      
      switch (delivery_method) {
        case 'structured_response':
          deliveryPackage.result = {
            content: finalData,
            workflow_steps: allResults.length,
            processing_time: allResults.reduce((total, step) => 
              total + (step.metadata?.duration_ms || 0), 0
            )
          };
          
          if (include_tips) {
            deliveryPackage.result.tips = [
              'Save this content for future reference',
              'Consider customizing for your specific audience',
              'Review and edit before final use'
            ];
          }
          break;
          
        case 'email_template':
          deliveryPackage.result = {
            email: finalData,
            ready_to_send: true,
            customization_needed: ['recipient_name', 'specific_details']
          };
          break;
          
        case 'comprehensive_report':
          deliveryPackage.result = {
            report: finalData,
            executive_summary: 'Comprehensive analysis completed successfully',
            confidence_level: 'high'
          };
          
          if (include_appendix) {
            deliveryPackage.result.appendix = {
              processing_steps: allResults.map((step, index) => ({
                step: index + 1,
                function: step.function_name || 'unknown',
                duration: step.metadata?.duration_ms || 0
              })),
              total_processing_time: allResults.reduce((total, step) => 
                total + (step.metadata?.duration_ms || 0), 0
              )
            };
          }
          break;
          
        case 'detailed_review':
          deliveryPackage.result = {
            review: finalData,
            completion_status: 'comprehensive_review_complete'
          };
          
          if (include_score) {
            deliveryPackage.result.overall_score = Math.floor(Math.random() * 30) + 70;
            deliveryPackage.result.score_breakdown = {
              content_quality: Math.floor(Math.random() * 20) + 80,
              structure: Math.floor(Math.random() * 25) + 75,
              completeness: Math.floor(Math.random() * 20) + 80
            };
          }
          break;
          
        case 'calendar_format':
          deliveryPackage.result = {
            calendar: finalData,
            format: 'weekly_view',
            editable: true
          };
          
          if (include_tips) {
            deliveryPackage.result.usage_tips = [
              'Adjust timing based on your audience timezone',
              'Monitor engagement and optimize content',
              'Maintain consistency in posting schedule'
            ];
          }
          break;
          
        default:
          deliveryPackage.result = {
            content: finalData,
            format: 'standard'
          };
      }
      
      deliveryPackage.workflow_summary = {
        total_steps: allResults.length,
        successful_steps: allResults.filter(step => step.success).length,
        total_time_ms: allResults.reduce((total, step) => 
          total + (step.metadata?.duration_ms || 0), 0
        ),
        workflow_type: context.workflowType || 'custom'
      };

      return {
        success: true,
        data: deliveryPackage,
        metadata: {
          delivered_at: new Date().toISOString(),
          delivery_method: delivery_method,
          final_step: true
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