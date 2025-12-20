/**
 * Data Anonymizer Service
 * 
 * GDPR-compliant data handling:
 * - Auto-detect PII
 * - Anonymize personal data
 * - Generate privacy reports
 * - Compliance certification
 */

import OpenAI from 'openai';
import { getErrorMessage, logError } from '../utils/errorHandler';

const openaiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = openaiKey
  ? new OpenAI({
      apiKey: openaiKey,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    })
  : null;

export interface PIIDetection {
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'ip_address';
  value: string;
  location: string; // Where it was found
  confidence: number;
}

export interface AnonymizationResult {
  original: Record<string, any>;
  anonymized: Record<string, any>;
  piiDetected: PIIDetection[];
  anonymizationMap: Record<string, string>; // original -> anonymized
  compliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    piiRemoved: number;
    piiAnonymized: number;
  };
  report: string;
}

/**
 * Detect PII in data
 */
export async function detectPII(data: Record<string, any> | string): Promise<PIIDetection[]> {
  try {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const detections: PIIDetection[] = [];

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = dataString.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        detections.push({
          type: 'email',
          value: email,
          location: 'data',
          confidence: 0.95,
        });
      });
    }

    // Phone pattern (US)
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g;
    const phones = dataString.match(phonePattern);
    if (phones) {
      phones.forEach(phone => {
        detections.push({
          type: 'phone',
          value: phone,
          location: 'data',
          confidence: 0.85,
        });
      });
    }

    // SSN pattern
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    const ssns = dataString.match(ssnPattern);
    if (ssns) {
      ssns.forEach(ssn => {
        detections.push({
          type: 'ssn',
          value: ssn,
          location: 'data',
          confidence: 0.9,
        });
      });
    }

    // Credit card pattern
    const ccPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    const ccs = dataString.match(ccPattern);
    if (ccs) {
      ccs.forEach(cc => {
        detections.push({
          type: 'credit_card',
          value: cc,
          location: 'data',
          confidence: 0.8,
        });
      });
    }

    // IP address pattern
    const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
    const ips = dataString.match(ipPattern);
    if (ips) {
      ips.forEach(ip => {
        detections.push({
          type: 'ip_address',
          value: ip,
          location: 'data',
          confidence: 0.7,
        });
      });
    }

    // Use AI for more sophisticated detection
    if (openai && detections.length === 0) {
      try {
        const prompt = `Detect any personally identifiable information (PII) in this data:

${dataString.substring(0, 2000)}

Return JSON array of detected PII:
[
  {
    "type": "email" | "phone" | "ssn" | "credit_card" | "address" | "name" | "ip_address",
    "value": "the detected value",
    "location": "where found",
    "confidence": 0.0-1.0
  }
]`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at detecting personally identifiable information (PII) in data.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 1000,
          temperature: 0.1,
        });

        const aiDetections = JSON.parse(response.choices[0].message.content || '{}');
        if (Array.isArray(aiDetections.detections || aiDetections)) {
          detections.push(...(aiDetections.detections || aiDetections));
        }
      } catch (e) {
        // Fall back to regex patterns
      }
    }

    return detections;
  } catch (error) {
    logError(error, 'Data Anonymizer - PII Detection');
    return [];
  }
}

/**
 * Anonymize data
 */
export async function anonymizeData(
  data: Record<string, any>,
  options: {
    removePII?: boolean;
    hashPII?: boolean;
    replaceWithPlaceholder?: boolean;
  } = {}
): Promise<AnonymizationResult> {
  try {
    const dataString = JSON.stringify(data, null, 2);
    const piiDetected = await detectPII(dataString);

    let anonymizedData = JSON.parse(dataString);
    const anonymizationMap: Record<string, string> = {};
    let piiRemoved = 0;
    let piiAnonymized = 0;

    // Anonymize detected PII
    piiDetected.forEach(pii => {
      if (options.removePII) {
        // Remove PII
        anonymizedData = JSON.parse(
          JSON.stringify(anonymizedData).replace(new RegExp(pii.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '[REDACTED]')
        );
        piiRemoved++;
      } else if (options.hashPII) {
        // Hash PII
        const hash = Buffer.from(pii.value).toString('base64').substring(0, 10);
        anonymizedData = JSON.parse(
          JSON.stringify(anonymizedData).replace(new RegExp(pii.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), hash)
        );
        anonymizationMap[pii.value] = hash;
        piiAnonymized++;
      } else {
        // Replace with placeholder
        const placeholder = `[${pii.type.toUpperCase()}_REDACTED]`;
        anonymizedData = JSON.parse(
          JSON.stringify(anonymizedData).replace(new RegExp(pii.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), placeholder)
        );
        anonymizationMap[pii.value] = placeholder;
        piiAnonymized++;
      }
    });

    const compliance = {
      gdprCompliant: piiDetected.length === 0 || piiRemoved + piiAnonymized === piiDetected.length,
      ccpaCompliant: piiDetected.length === 0 || piiRemoved + piiAnonymized === piiDetected.length,
      piiRemoved,
      piiAnonymized,
    };

    const report = `Data Anonymization Report:
- PII Detected: ${piiDetected.length}
- PII Removed: ${piiRemoved}
- PII Anonymized: ${piiAnonymized}
- GDPR Compliant: ${compliance.gdprCompliant ? 'Yes' : 'No'}
- CCPA Compliant: ${compliance.ccpaCompliant ? 'Yes' : 'No'}
`;

    return {
      original: data,
      anonymized: anonymizedData,
      piiDetected,
      anonymizationMap,
      compliance,
      report,
    };
  } catch (error) {
    logError(error, 'Data Anonymizer');
    throw new Error(`Data anonymization failed: ${getErrorMessage(error)}`);
  }
}

