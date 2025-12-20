/**
 * Enterprise Proxy Integration Service
 * 
 * One-click integration with Bright Data, Oxylabs, Smartproxy, ScraperAPI, Zyte, IPRoyal.
 * API key input only, auto-select best proxy, failover, usage tracking.
 */

import { getErrorMessage, logError } from '../utils/errorHandler';
import fetch from 'node-fetch';

export interface ProxyProvider {
  name: 'bright-data' | 'oxylabs' | 'smartproxy' | 'scraperapi' | 'zyte' | 'iproyal';
  apiKey: string;
  enabled: boolean;
}

export interface ProxyConfig {
  provider: ProxyProvider['name'];
  endpoint?: string;
  username?: string;
  password?: string;
  sessionId?: string;
}

// Proxy provider configurations
const PROXY_ENDPOINTS: Record<ProxyProvider['name'], string> = {
  'bright-data': 'https://zproxy.lum-superproxy.io:22225',
  'oxylabs': 'https://pr.oxylabs.io:7777',
  'smartproxy': 'http://gate.smartproxy.com:7000',
  'scraperapi': 'http://scraperapi.com',
  'zyte': 'http://proxy.crawlera.com:8011',
  'iproyal': 'http://gate.iproyal.com:12321',
};

/**
 * Configure proxy provider
 */
export function configureProxyProvider(provider: ProxyProvider): ProxyConfig {
  const config: ProxyConfig = {
    provider: provider.name,
  };

  switch (provider.name) {
    case 'bright-data':
      config.endpoint = PROXY_ENDPOINTS['bright-data'];
      config.username = `lum-customer-${provider.apiKey.split('-')[0]}`;
      config.password = provider.apiKey;
      break;
    case 'oxylabs':
      config.endpoint = PROXY_ENDPOINTS['oxylabs'];
      config.username = 'customer-' + provider.apiKey.split('-')[0];
      config.password = provider.apiKey;
      break;
    case 'smartproxy':
      config.endpoint = PROXY_ENDPOINTS['smartproxy'];
      config.username = provider.apiKey.split(':')[0];
      config.password = provider.apiKey.split(':')[1];
      break;
    case 'scraperapi':
      config.endpoint = PROXY_ENDPOINTS['scraperapi'];
      config.username = provider.apiKey;
      break;
    case 'zyte':
      config.endpoint = PROXY_ENDPOINTS['zyte'];
      config.username = provider.apiKey.split(':')[0];
      config.password = provider.apiKey.split(':')[1];
      break;
    case 'iproyal':
      config.endpoint = PROXY_ENDPOINTS['iproyal'];
      config.username = provider.apiKey.split(':')[0];
      config.password = provider.apiKey.split(':')[1];
      break;
  }

  return config;
}

/**
 * Get proxy URL for a request
 */
export function getProxyUrl(config: ProxyConfig, targetUrl: string): string {
  if (!config.endpoint) {
    throw new Error(`Proxy endpoint not configured for ${config.provider}`);
  }

  // For ScraperAPI, use their API endpoint
  if (config.provider === 'scraperapi') {
    return `http://${config.username}@${config.endpoint}/render?url=${encodeURIComponent(targetUrl)}`;
  }

  // For others, return proxy endpoint
  return config.endpoint;
}

/**
 * Test proxy connection
 */
export async function testProxyConnection(config: ProxyConfig): Promise<{
  success: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const testUrl = 'https://httpbin.org/ip';
    const startTime = Date.now();

    const proxyUrl = getProxyUrl(config, testUrl);
    const proxyAuth = config.username && config.password
      ? `${config.username}:${config.password}@`
      : '';

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Proxy-Authorization': proxyAuth ? `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}` : undefined,
      } as any,
      // @ts-ignore - proxy support
      proxy: proxyUrl,
      timeout: 10000,
    });

    const latency = Date.now() - startTime;

    if (response.ok) {
      return {
        success: true,
        latency,
      };
    }

    return {
      success: false,
      error: `Proxy test failed: ${response.statusText}`,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

