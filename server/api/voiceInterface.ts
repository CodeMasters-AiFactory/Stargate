/**
 * Voice Interface API Routes
 */

import express, { type Express, type Request, type Response } from 'express';
import { processVoiceCommand } from '../services/voiceInterface';
import { getErrorMessage, logError } from '../utils/errorHandler';
import { strictRateLimit } from '../middleware/rateLimiter';

export function registerVoiceInterfaceRoutes(app: Express) {
  /**
   * POST /api/voice/process
   * Process voice command (audio file)
   * Accepts: multipart/form-data with audio file OR JSON with base64 audio
   */
  app.post('/api/voice/process', strictRateLimit(), express.raw({ type: '*/*', limit: '10mb' }), async (req: Request, res: Response) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:15',message:'/api/voice/process entry',data:{contentType:req.headers['content-type'],bodyType:typeof req.body,bodyLength:req.body?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion agent log
    try {
      // Check Content-Type
      const contentType = req.headers['content-type'] || '';
      
      let audioBuffer: Buffer;
      let mimeType = 'audio/webm';

      if (contentType.includes('multipart/form-data')) {
        // Handle multipart form data
        // Note: For production, use multer or busboy for proper multipart parsing
        // For now, accept raw body as audio
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:24',message:'parsing multipart/form-data',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion agent log
        audioBuffer = req.body;
        mimeType = req.headers['content-type']?.split(';')[0] || 'audio/webm';
      } else if (contentType.includes('application/json')) {
        // Handle JSON with base64 audio
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:30',message:'parsing application/json',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion agent log
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (!body.audio) {
          return res.status(400).json({ error: 'Audio file is required (base64 encoded)' });
        }
        audioBuffer = Buffer.from(body.audio, 'base64');
        mimeType = body.mimeType || 'audio/webm';
      } else if (contentType.includes('audio/')) {
        // Raw audio file
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:37',message:'parsing raw audio',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion agent log
        audioBuffer = req.body;
        mimeType = contentType;
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:42',message:'invalid content type',data:{contentType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion agent log
        return res.status(400).json({ 
          error: 'Invalid content type. Send audio file as multipart/form-data, JSON with base64 audio, or raw audio file' 
        });
      }

      if (!audioBuffer || audioBuffer.length === 0) {
        return res.status(400).json({ error: 'Audio file is empty' });
      }

      // Process voice command
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:50',message:'before processVoiceCommand',data:{audioBufferLength:audioBuffer.length,mimeType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion agent log
      const result = await processVoiceCommand(audioBuffer, mimeType);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:52',message:'after processVoiceCommand',data:{hasTranscription:!!result.transcription,hasIntent:!!result.intent},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion agent log

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      logError(error, 'VoiceInterface API - Process');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });

  /**
   * POST /api/voice/text
   * Process text command (for testing without audio)
   */
  app.post('/api/voice/text', strictRateLimit(), async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required' });
      }

      // Import services
      const { extractIntent, generateClarifyingQuestions } = await import('../services/voiceInterface');

      // Extract intent
      const intent = await extractIntent(text);

      // Generate clarifying questions
      const clarifyingQuestions = await generateClarifyingQuestions(intent);

      res.json({
        success: true,
        transcription: text,
        intent,
        clarifyingQuestions,
      });
    } catch (error) {
      logError(error, 'VoiceInterface API - Text');
      res.status(500).json({
        success: false,
        error: getErrorMessage(error),
      });
    }
  });
}

