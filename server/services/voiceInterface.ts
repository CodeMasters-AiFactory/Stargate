/**
 * Voice Interface Service
 * Voice-to-website feature using Whisper API + GPT-4
 */

import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';

// Lazy-load OpenAI client to avoid startup crash when API key is missing
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * Extract intent from voice input
 */
export interface VoiceIntent {
  industry: string;
  location?: {
    city: string;
    state: string;
    country: string;
  };
  stylePreferences?: string[];
  targetAudience?: string;
  services?: string[];
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

/**
 * Transcribe audio to text using Whisper
 */
export async function transcribeAudio(audioBuffer: Buffer, mimeType: string = 'audio/webm'): Promise<string> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:36',message:'transcribeAudio entry',data:{bufferSize:audioBuffer.length,mimeType},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion agent log
  try {
    // OpenAI SDK accepts Buffer directly, or we can use formdata-node for File API
    // Create File object using formdata-node (Node.js compatible)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:39',message:'before formdata-node import',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    const { File } = await import('formdata-node');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:40',message:'after formdata-node import',data:{fileConstructor:typeof File},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    const file = new File([audioBuffer], 'audio.webm', { type: mimeType });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:42',message:'before OpenAI API call',data:{fileSize:file.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    const transcription = await getOpenAI().audio.transcriptions.create({
      file: file as any,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:49',message:'after OpenAI API call',data:{transcriptionType:typeof transcription,transcriptionLength:typeof transcription==='string'?transcription.length:'object'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log

    // OpenAI returns string when response_format is 'text'
    if (typeof transcription === 'string') {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:54',message:'returning string transcription',data:{length:transcription.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion agent log
      return transcription;
    }
    // Fallback: if it's an object, extract text property
    const result = (transcription as any).text || String(transcription);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:58',message:'returning object transcription',data:{resultLength:result.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    return result;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/7d111e5a-2ec4-45e0-974b-ab7cc6f8f111',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'voiceInterface.ts:60',message:'transcribeAudio error',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion agent log
    logError(error, 'VoiceInterface - TranscribeAudio');
    throw new Error(`Failed to transcribe audio: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract intent from transcribed text using GPT-4
 */
export async function extractIntent(text: string): Promise<VoiceIntent> {
  try {
    const prompt = `Extract business information from this voice command. Return ONLY valid JSON, no other text.

Voice command: "${text}"

Extract:
- industry (required): The business industry (e.g., "Healthcare", "Legal", "Restaurant", "Technology")
- location (optional): { city, state, country }
- stylePreferences (optional): Array of style preferences mentioned
- targetAudience (optional): Target customer demographic
- services (optional): Array of services offered
- businessName (optional): Business name if mentioned
- phone (optional): Phone number if mentioned
- email (optional): Email if mentioned
- address (optional): Address if mentioned

Return JSON format:
{
  "industry": "string",
  "location": { "city": "string", "state": "string", "country": "string" },
  "stylePreferences": ["string"],
  "targetAudience": "string",
  "services": ["string"],
  "businessName": "string",
  "phone": "string",
  "email": "string",
  "address": "string"
}`;

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that extracts structured business information from voice commands. Always return valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4');
    }

    const { safeJsonParse, isVoiceIntent } = await import('../utils/jsonValidator');
    const intent = safeJsonParse<VoiceIntent>(content, isVoiceIntent, 'voice intent');

    // Validate required fields
    if (!intent.industry) {
      throw new Error('Industry is required');
    }

    console.log(`[VoiceInterface] ✅ Extracted intent: ${intent.industry}${intent.location ? ` in ${intent.location.city}, ${intent.location.state}` : ''}`);

    return intent;
  } catch (error) {
    logError(error, 'VoiceInterface - ExtractIntent');
    throw new Error(`Failed to extract intent: ${getErrorMessage(error)}`);
  }
}

/**
 * Generate clarifying questions based on incomplete intent
 */
export async function generateClarifyingQuestions(intent: VoiceIntent): Promise<string[]> {
  const questions: string[] = [];

  if (!intent.businessName) {
    questions.push('What is your business name?');
  }

  if (!intent.location) {
    questions.push('Where is your business located? (city and state)');
  }

  if (!intent.services || intent.services.length === 0) {
    questions.push('What services does your business offer?');
  }

  if (!intent.targetAudience) {
    questions.push('Who is your target audience?');
  }

  if (!intent.phone) {
    questions.push('What is your business phone number?');
  }

  if (!intent.email) {
    questions.push('What is your business email address?');
  }

  return questions;
}

/**
 * Process voice command end-to-end
 */
export async function processVoiceCommand(audioBuffer: Buffer, mimeType?: string): Promise<{
  transcription: string;
  intent: VoiceIntent;
  clarifyingQuestions: string[];
}> {
  try {
    // Step 1: Transcribe audio
    console.log('[VoiceInterface] 🎤 Transcribing audio...');
    const transcription = await transcribeAudio(audioBuffer, mimeType);
    console.log(`[VoiceInterface] 📝 Transcription: "${transcription}"`);

    // Step 2: Extract intent
    console.log('[VoiceInterface] 🧠 Extracting intent...');
    const intent = await extractIntent(transcription);

    // Step 3: Generate clarifying questions
    const clarifyingQuestions = await generateClarifyingQuestions(intent);

    return {
      transcription,
      intent,
      clarifyingQuestions,
    };
  } catch (error) {
    logError(error, 'VoiceInterface - ProcessVoiceCommand');
    throw error;
  }
}

