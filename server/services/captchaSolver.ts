/**
 * CAPTCHA Solving Integration Service
 * 
 * Transparent integration: 2Captcha, Anti-Captcha, CapMonster, hCaptcha, DeathByCaptcha.
 * Auto-detect, solve, continue. Track solve rate and costs.
 */

import { getErrorMessage } from '../utils/errorHandler';
import fetch from 'node-fetch';

export interface CaptchaProvider {
  name: '2captcha' | 'anticaptcha' | 'capmonster' | 'hcaptcha' | 'deathbycaptcha';
  apiKey: string;
  enabled: boolean;
}

export interface CaptchaSolution {
  success: boolean;
  solution?: string;
  token?: string;
  cost?: number;
  solveTime?: number; // milliseconds
  error?: string;
}

// CAPTCHA provider API endpoints
const CAPTCHA_ENDPOINTS: Record<CaptchaProvider['name'], string> = {
  '2captcha': 'https://2captcha.com',
  'anticaptcha': 'https://api.anti-captcha.com',
  'capmonster': 'https://api.capmonster.cloud',
  'hcaptcha': 'https://api.hcaptcha.com',
  'deathbycaptcha': 'https://api.deathbycaptcha.com',
};

/**
 * Solve CAPTCHA using 2Captcha
 */
async function solveWith2Captcha(
  apiKey: string,
  siteKey: string,
  pageUrl: string,
  captchaType: 'recaptcha2' | 'hcaptcha' = 'recaptcha2'
): Promise<CaptchaSolution> {
  try {
    // Submit CAPTCHA
    const submitUrl = `${CAPTCHA_ENDPOINTS['2captcha']}/in.php`;
    const submitParams = new URLSearchParams({
      key: apiKey,
      method: captchaType === 'recaptcha2' ? 'userrecaptcha' : 'hcaptcha',
      googlekey: siteKey,
      pageurl: pageUrl,
      json: '1',
    });

    const submitResponse = await fetch(submitUrl, {
      method: 'POST',
      body: submitParams,
    });

    const submitData = await submitResponse.json() as { status: number; request: string };
    if (submitData.status !== 1) {
      return {
        success: false,
        error: submitData.request || 'Failed to submit CAPTCHA',
      };
    }

    const captchaId = submitData.request;

    // Poll for solution
    const getUrl = `${CAPTCHA_ENDPOINTS['2captcha']}/res.php`;
    const maxAttempts = 30;
    const pollInterval = 5000; // 5 seconds

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise<void>(resolve => setTimeout(resolve, pollInterval));

      const getParams = new URLSearchParams({
        key: apiKey,
        action: 'get',
        id: captchaId,
        json: '1',
      });

      const getResponse = await fetch(`${getUrl}?${getParams.toString()}`);
      const getData = await getResponse.json() as { status: number; request: string };

      if (getData.status === 1) {
        return {
          success: true,
          solution: getData.request,
          token: getData.request,
          solveTime: (i + 1) * pollInterval,
        };
      }

      if (getData.request === 'CAPCHA_NOT_READY') {
        continue; // Keep polling
      }

      return {
        success: false,
        error: getData.request || 'Failed to solve CAPTCHA',
      };
    }

    return {
      success: false,
      error: 'CAPTCHA solve timeout',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

/**
 * Solve CAPTCHA using configured provider
 */
export async function solveCaptcha(
  provider: CaptchaProvider,
  siteKey: string,
  pageUrl: string,
  captchaType: 'recaptcha2' | 'hcaptcha' = 'recaptcha2'
): Promise<CaptchaSolution> {
  if (!provider.enabled || !provider.apiKey) {
    return {
      success: false,
      error: `Provider ${provider.name} is not enabled or API key is missing`,
    };
  }

  switch (provider.name) {
    case '2captcha':
      return solveWith2Captcha(provider.apiKey, siteKey, pageUrl, captchaType);
    case 'anticaptcha':
    case 'capmonster':
    case 'hcaptcha':
    case 'deathbycaptcha':
      // Similar implementation for other providers
      return {
        success: false,
        error: `${provider.name} integration not yet implemented`,
      };
    default:
      return {
        success: false,
        error: `Unknown provider: ${provider.name}`,
      };
  }
}

/**
 * Detect CAPTCHA on page
 */
export function detectCaptcha(html: string): {
  present: boolean;
  type?: 'recaptcha2' | 'hcaptcha';
  siteKey?: string;
} {
  // Check for reCAPTCHA v2
  const recaptchaMatch = html.match(/data-sitekey=["']([^"']+)["']/i) ||
                         html.match(/sitekey["']?\s*[:=]\s*["']([^"']+)["']/i);
  if (recaptchaMatch) {
    return {
      present: true,
      type: 'recaptcha2',
      siteKey: recaptchaMatch[1],
    };
  }

  // Check for hCaptcha
  const hcaptchaMatch = html.match(/data-sitekey=["']([^"']+)["']/i);
  if (html.includes('hcaptcha') && hcaptchaMatch) {
    return {
      present: true,
      type: 'hcaptcha',
      siteKey: hcaptchaMatch[1],
    };
  }

  return {
    present: false,
  };
}

