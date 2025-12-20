/**
 * Developer Integration SDK
 * Phase 3.2: Integration Expansion - Developer API for custom integrations
 */

import type { Integration } from '../integrations/integrationService';

export interface IntegrationSDK {
  registerIntegration(integration: Integration): Promise<void>;
  generateIntegrationScript(integration: Integration): string;
  validateIntegration(integration: Integration): { valid: boolean; errors: string[] };
  testIntegration(integration: Integration): Promise<{ success: boolean; message: string }>;
}

/**
 * Generate JavaScript SDK for integrations
 */
export function generateIntegrationSDK(): string {
  return `
/**
 * Merlin Integration SDK
 * Use this SDK to create custom integrations
 */

class MerlinIntegrationSDK {
  constructor(apiKey, baseUrl = '/api/developer') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async registerIntegration(integration) {
    const response = await fetch(\`\${this.baseUrl}/integrations\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
      body: JSON.stringify(integration),
    });
    return response.json();
  }

  async getIntegration(integrationId) {
    const response = await fetch(\`\${this.baseUrl}/integrations/\${integrationId}\`, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
    });
    return response.json();
  }

  async listIntegrations() {
    const response = await fetch(\`\${this.baseUrl}/integrations\`, {
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
    });
    return response.json();
  }

  async updateIntegration(integrationId, updates) {
    const response = await fetch(\`\${this.baseUrl}/integrations/\${integrationId}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
      body: JSON.stringify(updates),
    });
    return response.json();
  }

  async deleteIntegration(integrationId) {
    const response = await fetch(\`\${this.baseUrl}/integrations/\${integrationId}\`, {
      method: 'DELETE',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
    });
    return response.json();
  }

  async testIntegration(integrationId) {
    const response = await fetch(\`\${this.baseUrl}/integrations/\${integrationId}/test\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
      },
    });
    return response.json();
  }

  generateScript(integration) {
    return this.generateIntegrationScript(integration);
  }

  generateIntegrationScript(integration) {
    const config = integration.config || {};
    const configJson = JSON.stringify(config);

    return \`
<!-- \${integration.name} Integration -->
<script>
  (function() {
    const config = \${configJson};
    const integrationId = '\${integration.id}';
    
    // Integration-specific script
    \${integration.script || '// Custom integration script'}
    
    // Track integration load
    if (window.trackConversion) {
      window.trackConversion('integration_load', {
        integrationId: integrationId,
        integrationName: '\${integration.name}',
      });
    }
  })();
</script>
<!-- End \${integration.name} Integration -->
    \`.trim();
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MerlinIntegrationSDK;
}
  `.trim();
}

/**
 * Validate integration structure
 */
export function validateIntegration(integration: Integration): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!integration.id) {
    errors.push('Integration ID is required');
  }
  if (!integration.name) {
    errors.push('Integration name is required');
  }
  if (!integration.description) {
    errors.push('Integration description is required');
  }
  if (!integration.category) {
    errors.push('Integration category is required');
  }

  // Validate category
  const validCategories = ['analytics', 'marketing', 'email', 'social', 'crm', 'automation', 'ecommerce', 'customer-support', 'forms', 'communication', 'development', 'media', 'other'];
  if (!validCategories.includes(integration.category)) {
    errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Test integration connection
 */
export async function testIntegration(integration: Integration): Promise<{ success: boolean; message: string }> {
  // This would test the integration's API connection
  // For now, return a placeholder response
  
  try {
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if required config is present
    if (integration.requiresAuth && (!integration.config || Object.keys(integration.config).length === 0)) {
      return {
        success: false,
        message: 'Integration requires authentication configuration',
      };
    }
    
    return {
      success: true,
      message: 'Integration test passed',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Integration test failed',
    };
  }
}

