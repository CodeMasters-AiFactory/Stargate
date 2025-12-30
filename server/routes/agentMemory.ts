import express from 'express';
import { persistentMemory } from '../memory/PersistentMemorySystem';

const router = express.Router();

// Initialize agent memory session
router.post('/initialize', async (req, res): Promise<void> => {
  try {
    const { sessionId, userId, agentId, projectId } = req.body;

    if (!sessionId || !userId || !agentId) {
      res.status(400).json({
        error: 'Missing required parameters: sessionId, userId, agentId'
      });
      return;
    }

    // Initialize or recover session memory
    const memoryContext = await persistentMemory.initializeSession(
      sessionId, 
      userId, 
      agentId
    );

    // Get conversation history
    const conversationHistory = await persistentMemory.getConversationHistory(sessionId);

    // Get project memory if projectId provided
    let projectMemory = null;
    if (projectId) {
      projectMemory = await persistentMemory.getProjectMemory(projectId, userId);
    }

    // Generate context summary
    const contextSummary = await persistentMemory.generateContextSummary(userId, projectId);

    res.json({
      success: true,
      context: memoryContext,
      conversationHistory,
      projectMemory,
      contextSummary,
      message: 'Memory session initialized successfully'
    });

  } catch (error) {
    console.error('Memory initialization error:', error);
    res.status(500).json({
      error: 'Failed to initialize memory session',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Save conversation message
router.post('/message', async (req, res): Promise<void> => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({
        error: 'Missing required parameters: sessionId, message'
      });
      return;
    }

    await persistentMemory.addConversationMessage(sessionId, message);

    res.json({
      success: true,
      message: 'Message saved successfully'
    });

  } catch (error) {
    console.error('Message save error:', error);
    res.status(500).json({
      error: 'Failed to save message',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update conversation context
router.post('/context', async (req, res): Promise<void> => {
  try {
    const { sessionId, updates } = req.body;

    if (!sessionId || !updates) {
      res.status(400).json({
        error: 'Missing required parameters: sessionId, updates'
      });
      return;
    }

    await persistentMemory.updateConversationContext(sessionId, updates);

    res.json({
      success: true,
      message: 'Context updated successfully'
    });

  } catch (error) {
    console.error('Context update error:', error);
    res.status(500).json({
      error: 'Failed to update context',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Save project memory
router.post('/project', async (req, res): Promise<void> => {
  try {
    const { projectContext, userId } = req.body;

    if (!projectContext || !userId) {
      res.status(400).json({
        error: 'Missing required parameters: projectContext, userId'
      });
      return;
    }

    await persistentMemory.saveProjectMemory(projectContext, userId);

    res.json({
      success: true,
      message: 'Project memory saved successfully'
    });

  } catch (error) {
    console.error('Project memory save error:', error);
    res.status(500).json({
      error: 'Failed to save project memory',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 100 } = req.query;

    const history = await persistentMemory.getConversationHistory(
      sessionId, 
      parseInt(limit as string)
    );

    res.json({
      success: true,
      history,
      count: history.length
    });

  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve conversation history',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Save user profile
router.post('/profile', async (req, res): Promise<void> => {
  try {
    const { userId, profile } = req.body;

    if (!userId || !profile) {
      res.status(400).json({
        error: 'Missing required parameters: userId, profile'
      });
      return;
    }

    await persistentMemory.saveUserProfile(userId, profile);

    res.json({
      success: true,
      message: 'User profile saved successfully'
    });

  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({
      error: 'Failed to save user profile',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;

    const profile = await persistentMemory.getUserProfile(userId);

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Agent chat endpoint with memory integration
router.post('/chat', async (req, res): Promise<void> => {
  try {
    const { sessionId, message, memoryContext, projectId } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({
        error: 'Missing required parameters: sessionId, message'
      });
      return;
    }

    // Get memory context
    const context = memoryContext || await persistentMemory.getMemoryContext(sessionId);

    if (!context) {
      res.status(400).json({
        error: 'No memory context found. Please initialize session first.'
      });
      return;
    }

    // Process message with AI (integrate with your existing AI system)
    const aiResponse = await processMessageWithAI(message, context, projectId);

    // Save AI response to memory
    const agentMessage = {
      id: `agent-${Date.now()}`,
      type: 'agent' as const,
      content: aiResponse.content,
      metadata: aiResponse.metadata,
      timestamp: new Date()
    };

    await persistentMemory.addConversationMessage(sessionId, agentMessage);

    // Update conversation context if needed
    if (aiResponse.contextUpdates) {
      await persistentMemory.updateConversationContext(sessionId, aiResponse.contextUpdates);
    }

    // Save project updates if any
    if (aiResponse.projectData && projectId) {
      await persistentMemory.saveProjectMemory({
        projectId,
        projectName: aiResponse.projectData.name || 'Untitled Project',
        ...aiResponse.projectData
      }, context.userId);
    }

    res.json({
      success: true,
      content: aiResponse.content,
      metadata: aiResponse.metadata,
      updatedContext: aiResponse.contextUpdates ? { 
        ...context, 
        conversationContext: { 
          ...context.conversationContext, 
          ...aiResponse.contextUpdates 
        } 
      } : undefined,
      projectData: aiResponse.projectData
    });

  } catch (error) {
    console.error('Agent chat error:', error);
    res.status(500).json({
      error: 'Failed to process agent chat',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

import { memoryAwareAgent } from '../ai/MemoryAwareAgent';

// Helper function to process message with AI
async function processMessageWithAI(message: string, context: any, projectId?: string) {
  try {
    // Use the real memory-aware agent with AI models
    const response = await memoryAwareAgent.processMessage(
      context.sessionId,
      message,
      context,
      projectId
    );

    // Check if response indicates project creation
    let projectData = null;
    if (response.contextUpdates?.phase === 'building' || 
        response.content.includes('Starting Project Creation') ||
        response.actions?.includes('create_project')) {
      
      projectData = {
        type: context.conversationContext?.projectType || 'web app',
        name: extractProjectName(message, response.content) || 'New Project',
        requirements: context.conversationContext?.requirements || [message],
        phase: 'building',
        technologies: response.contextUpdates?.mentionedTechnologies || [],
        agent: context.agentId
      };
    }

    return {
      content: response.content,
      metadata: response.metadata,
      contextUpdates: response.contextUpdates,
      projectData
    };
    
  } catch (error) {
    console.error('AI processing error:', error);
    
    // Fallback response that still maintains memory context
    return {
      content: `I encountered an issue processing your request, but don't worry - I've saved your message and can access our full conversation history. 

Based on our previous context, I understand you're ${context.conversationContext?.phase === 'building' ? 'working on a project' : 'looking to start something new'}. 

Once my AI processing is restored, I'll be able to continue with full memory of our conversation. Your context is safely stored and will never be lost.`,
      metadata: {
        error: true,
        memoryEnabled: true,
        timestamp: new Date().toISOString()
      },
      contextUpdates: null,
      projectData: null
    };
  }
}

// Helper to extract project name from conversation
function extractProjectName(userMessage: string, _aiResponse: string): string | null {
  const lowerMessage = userMessage.toLowerCase();
  
  // Look for explicit project names
  if (lowerMessage.includes('project called') || lowerMessage.includes('project named')) {
    const match = userMessage.match(/project (called|named) ([a-zA-Z0-9\s-]+)/i);
    if (match) return match[2].trim();
  }
  
  // Look for app names
  if (lowerMessage.includes('app called') || lowerMessage.includes('app named')) {
    const match = userMessage.match(/app (called|named) ([a-zA-Z0-9\s-]+)/i);
    if (match) return match[2].trim();
  }
  
  // Generate name based on project type
  if (lowerMessage.includes('ecommerce') || lowerMessage.includes('shop')) {
    return 'E-commerce Platform';
  } else if (lowerMessage.includes('blog')) {
    return 'Blog Platform';
  } else if (lowerMessage.includes('chat') || lowerMessage.includes('messaging')) {
    return 'Chat Application';
  } else if (lowerMessage.includes('dashboard')) {
    return 'Dashboard Application';
  }
  
  return null;
}

export default router;