/**
 * Integration Script Generators
 * Phase 1.4: Script generators for all 60+ integrations
 */

import type { IntegrationScript } from './integrationService';

/**
 * Generate script for specific integration
 * Expanded to handle all 60+ integrations
 */
export function generateScriptForIntegration(integration: any): IntegrationScript {
  const integrationId = integration.id || '';
  
  // Analytics
  if (integrationId === 'google-analytics') return generateGoogleAnalyticsScript(integration.config);
  if (integrationId === 'mixpanel') return generateMixpanelScript(integration.config);
  if (integrationId === 'amplitude') return generateAmplitudeScript(integration.config);
  if (integrationId === 'segment') return generateSegmentScript(integration.config);
  if (integrationId === 'hotjar') return generateHotjarScript(integration.config);
  if (integrationId === 'fullstory') return generateFullStoryScript(integration.config);
  if (integrationId === 'posthog') return generatePostHogScript(integration.config);
  if (integrationId === 'plausible') return generatePlausibleScript(integration.config);
  if (integrationId === 'fathom') return generateFathomScript(integration.config);
  
  // Marketing
  if (integrationId === 'facebook-pixel') return generateFacebookPixelScript(integration.config);
  if (integrationId === 'klaviyo') return generateKlaviyoScript(integration.config);
  if (integrationId === 'activecampaign') return generateActiveCampaignScript(integration.config);
  if (integrationId === 'omnisend') return generateOmnisendScript(integration.config);
  if (integrationId === 'brevo') return generateBrevoScript(integration.config);
  if (integrationId === 'hubspot') return generateHubSpotScript(integration.config);
  if (integrationId === 'salesforce') return generateSalesforceScript(integration.config);
  if (integrationId === 'vercel-analytics') return generateVercelAnalyticsScript(integration.config);
  
  // Email
  if (integrationId === 'mailchimp') return generateMailchimpScript(integration.config);
  if (integrationId === 'sendgrid') return generateSendGridScript(integration.config);
  if (integrationId === 'convertkit') return generateConvertKitScript(integration.config);
  if (integrationId === 'constant-contact') return generateConstantContactScript(integration.config);
  if (integrationId === 'campaign-monitor') return generateCampaignMonitorScript(integration.config);
  
  // Social
  if (integrationId === 'instagram') return generateInstagramScript(integration.config);
  if (integrationId === 'twitter') return generateTwitterScript(integration.config);
  if (integrationId === 'linkedin') return generateLinkedInScript(integration.config);
  if (integrationId === 'tiktok') return generateTikTokScript(integration.config);
  if (integrationId === 'pinterest') return generatePinterestScript(integration.config);
  if (integrationId === 'youtube') return generateYouTubeScript(integration.config);
  
  // CRM
  if (integrationId === 'hubspot-crm') return generateHubSpotCRMScript(integration.config);
  if (integrationId === 'salesforce-crm') return generateSalesforceCRMScript(integration.config);
  if (integrationId === 'pipedrive') return generatePipedriveScript(integration.config);
  if (integrationId === 'zoho-crm') return generateZohoCRMScript(integration.config);
  
  // Automation
  if (integrationId === 'zapier') return generateZapierScript(integration.config);
  if (integrationId === 'make') return generateMakeScript(integration.config);
  if (integrationId === 'ifttt') return generateIFTTTScript(integration.config);
  if (integrationId === 'n8n') return generateN8NScript(integration.config);
  
  // E-commerce
  if (integrationId === 'shopify') return generateShopifyScript(integration.config);
  if (integrationId === 'woocommerce') return generateWooCommerceScript(integration.config);
  if (integrationId === 'bigcommerce') return generateBigCommerceScript(integration.config);
  
  // Customer Support
  if (integrationId === 'intercom') return generateIntercomScript(integration.config);
  if (integrationId === 'zendesk') return generateZendeskScript(integration.config);
  if (integrationId === 'freshdesk') return generateFreshdeskScript(integration.config);
  if (integrationId === 'drift') return generateDriftScript(integration.config);
  if (integrationId === 'crisp') return generateCrispScript(integration.config);
  if (integrationId === 'livechat') return generateLiveChatScript(integration.config);
  
  // Forms
  if (integrationId === 'typeform') return generateTypeformScript(integration.config);
  if (integrationId === 'jotform') return generateJotFormScript(integration.config);
  if (integrationId === 'calendly') return generateCalendlyScript(integration.config);
  
  // Communication
  if (integrationId === 'slack') return generateSlackScript(integration.config);
  if (integrationId === 'discord') return generateDiscordScript(integration.config);
  if (integrationId === 'telegram') return generateTelegramScript(integration.config);
  if (integrationId === 'whatsapp-business') return generateWhatsAppBusinessScript(integration.config);
  if (integrationId === 'twilio') return generateTwilioScript(integration.config);
  
  // Other
  if (integrationId === 'cloudflare') return generateCloudflareScript(integration.config);
  
  // Default: return empty script
  return {};
}

// ============================================
// ANALYTICS SCRIPTS
// ============================================

function generateGoogleAnalyticsScript(config: Record<string, any>): IntegrationScript {
  const measurementId = config.measurementId || config.trackingId;
  if (!measurementId) return {};
  
  return {
    head: `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${measurementId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${measurementId}');
</script>`,
  };
}

function generateMixpanelScript(config: Record<string, any>): IntegrationScript {
  const token = config.projectToken || config.token;
  if (!token) return {};
  
  return {
    head: `<!-- Mixpanel -->
<script type="text/javascript">
  (function(e,a){if(!a.__SV){var b=window;try{var c,l,i,j=b.location,g=j.hash;c=function(a,b){return(l=a.match(RegExp(b+"=([^&]*)")))?l[1]:null};g&&c(g,"state")&&(i=JSON.parse(decodeURIComponent(c(g,"state"))),"mpeditor"===i.action&&(b.sessionStorage.setItem("_mpcehash",g),history.replaceState(i.desiredHash||"",e.title,j.pathname+j.search)))}catch(m){}var k,h;window.mixpanel=a;a._i=[];a.init=function(b,c,f){function e(b,a){var c=a.split(".");2==c.length&&(b=b[c[0]],a=c[1]);b[a]=function(){b.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var d=a;"undefined"!==typeof f?d=a[f]=[]:f="mixpanel";d.people=d.people||[];d.toString=function(b){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);b||(a+=" (stub)");return a};d.people.toString=function(){return d.toString(1)+".people (stub)"};k="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<k.length;h++)e(d,k[h]);a._i.push([b,c,f])};a.__SV=1.2;b=e.createElement("script");b.type="text/javascript";b.async=!0;b.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\\/\\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";c=e.getElementsByTagName("script")[0];c.parentNode.insertBefore(b,c)}})(document,window.mixpanel||[]);
  mixpanel.init('${token}');
</script>`,
  };
}

function generateAmplitudeScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  if (!apiKey) return {};
  
  return {
    head: `<!-- Amplitude -->
<script type="text/javascript">
  (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript";
  r.async=true;r.src="https://cdn.amplitude.com/libs/amplitude-8.0.0-min.gz.js";
  r.onload=function(){e.amplitude.runQueuedFunctions()};
  var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i);
  function s(e,t){e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
  return this}}var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"];
  for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[];return this};
  var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];
  for(var u=0;u<l.length;u++){s(c,l[u])}n.Revenue=c;var d=function(){this._q=[];return this};
  var p=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"];
  for(var u=0;u<p.length;u++){s(d,p[u])}n._d=d;
  e.amplitude=n})(window,document);
  amplitude.init('${apiKey}');
</script>`,
  };
}

function generateSegmentScript(config: Record<string, any>): IntegrationScript {
  const writeKey = config.writeKey;
  if (!writeKey) return {};
  
  return {
    head: `<!-- Segment -->
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t,e){var n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src="https://cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a);analytics._loadOptions=e};analytics.SNIPPET_VERSION="4.1.0";
  analytics.load("${writeKey}");
  analytics.page();
  }}}();
</script>`,
  };
}

function generateHotjarScript(config: Record<string, any>): IntegrationScript {
  const siteId = config.siteId;
  if (!siteId) return {};
  
  return {
    head: `<!-- Hotjar -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:${siteId},hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>`,
  };
}

function generateFullStoryScript(config: Record<string, any>): IntegrationScript {
  const orgId = config.orgId;
  if (!orgId) return {};
  
  return {
    head: `<!-- FullStory -->
<script>
  window['_fs_debug'] = false;
  window['_fs_host'] = 'fullstory.com';
  window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
  window['_fs_org'] = '${orgId}';
  window['_fs_namespace'] = 'FS';
  (function(m,n,e,t,l,o,g,y){
    if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'); } return;}
    g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
    o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script;
    y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
    g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
    g.anonymize=function(){g.identify(!!0)};
    g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
    g.log = function(a,b){g("log",[a,b])};
    g.consent=function(a){g("consent",!arguments.length||a)};
    g.identifyAccount=function(i,v){o='account';g(i,v)};
    g.clearUserCookie=function(){};
    g.setVars=function(n,p){g('setVars',[n,p]);};
    g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
    if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
    g._v="1.3.0";
  })(window,document,window['_fs_namespace'],'script','user');
</script>`,
  };
}

function generatePostHogScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  const host = config.host || 'https://app.posthog.com';
  if (!apiKey) return {};
  
  return {
    head: `<!-- PostHog -->
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init('${apiKey}',{api_host:'${host}'})
</script>`,
  };
}

function generatePlausibleScript(config: Record<string, any>): IntegrationScript {
  const domain = config.domain;
  if (!domain) return {};
  
  return {
    head: `<!-- Plausible Analytics -->
<script defer data-domain="${domain}" src="https://plausible.io/js/script.js"></script>`,
  };
}

function generateFathomScript(config: Record<string, any>): IntegrationScript {
  const siteId = config.siteId;
  if (!siteId) return {};
  
  return {
    head: `<!-- Fathom Analytics -->
<script>
  (function(f, a, t, h, o, m){
    a[h]=a[h]||function(){
      (a[h].q=a[h].q||[]).push(arguments)
    };
    o=f.createElement('script'),
    m=f.getElementsByTagName('script')[0];
    o.async=1; o.src=t; o.id='fathom-script';
    m.parentNode.insertBefore(o,m)
  })(document, window, 'https://cdn.usefathom.com/tracker.js', 'fathom');
  fathom('set', 'siteId', '${siteId}');
  fathom('trackPageview');
</script>`,
  };
}

// ============================================
// MARKETING SCRIPTS
// ============================================

function generateFacebookPixelScript(config: Record<string, any>): IntegrationScript {
  const pixelId = config.pixelId;
  if (!pixelId) return {};
  
  return {
    head: `<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${pixelId}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
/></noscript>`,
  };
}

function generateKlaviyoScript(config: Record<string, any>): IntegrationScript {
  const publicApiKey = config.publicApiKey;
  if (!publicApiKey) return {};
  
  return {
    body: `<!-- Klaviyo -->
<script async type="text/javascript" src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${publicApiKey}"></script>`,
  };
}

function generateActiveCampaignScript(config: Record<string, any>): IntegrationScript {
  const accountId = config.accountId;
  const actid = config.actid;
  if (!accountId || !actid) return {};
  
  return {
    body: `<!-- ActiveCampaign -->
<script type="text/javascript">
  (function(e,t,o,n,p,r,i){e.visitorGlobalObjectAlias=n;e[e.visitorGlobalObjectAlias]=e[e.visitorGlobalObjectAlias]||function(){(e[e.visitorGlobalObjectAlias].q=e[e.visitorGlobalObjectAlias].q||[]).push(arguments)};e[e.visitorGlobalObjectAlias].l=(new Date).getTime();r=t.createElement("script");r.src=o;r.async=true;i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)})(window,document,"https://diffuser-cdn.app-us1.com/diffuser/diffuser.js","vgo");
  vgo('setAccount', '${accountId}');
  vgo('setTrackByDefault', true);
  vgo('process');
</script>`,
  };
}

function generateOmnisendScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  if (!apiKey) return {};
  
  return {
    body: `<!-- Omnisend -->
<script type="text/javascript">
  window.omnisend = window.omnisend || [];
  omnisend.load("${apiKey}", {
    "node": "api-us1.omnisend.com"
  });
</script>`,
  };
}

function generateBrevoScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  if (!apiKey) return {};
  
  return {
    body: `<!-- Brevo (Sendinblue) -->
<script>
  (function() {
    window.sib = { equeue: [], client_key: "${apiKey}" };
    window.sendinblue = {};
    for (var j = ['track', 'identify', 'trackLink', 'page'], i = 0; i < j.length; i++) {
      (function(k) {
        window.sendinblue[k] = function() {
          var arg = Array.prototype.slice.call(arguments);
          (window.sib[k] || function() {
            var t = {};
            t[k] = arg;
            window.sib.equeue.push(t);
          })(arg[0], arg[1], arg[2]);
        };
      })(j[i]);
    }
    var n = document.createElement("script"),
        i = document.getElementsByTagName("script")[0];
    n.type = "text/javascript", n.id = "sendinblue-js", n.async = !0, n.src = "https://sibautomation.com/sa.js?key=" + window.sib.client_key, i.parentNode.insertBefore(n, i);
  })();
</script>`,
  };
}

function generateHubSpotScript(config: Record<string, any>): IntegrationScript {
  const portalId = config.portalId;
  if (!portalId) return {};
  
  return {
    body: `<!-- HubSpot -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/${portalId}.js"></script>`,
  };
}

function generateSalesforceScript(config: Record<string, any>): IntegrationScript {
  const accountId = config.accountId;
  if (!accountId) return {};
  
  return {
    body: `<!-- Salesforce Marketing Cloud -->
<script type="text/javascript" src="https://${accountId}.tt.omtrdc.net/m2.js"></script>`,
  };
}

function generateVercelAnalyticsScript(_config: Record<string, any>): IntegrationScript {
  // Vercel Analytics is typically handled via script tag or Next.js integration
  return {
    head: `<!-- Vercel Analytics -->
<script defer src="/_vercel/insights/script.js"></script>`,
  };
}

// ============================================
// EMAIL SCRIPTS
// ============================================

function generateMailchimpScript(config: Record<string, any>): IntegrationScript {
  return {
    body: `<!-- Mailchimp Integration -->
<script>
  window.MAILCHIMP_CONFIG = ${JSON.stringify(config)};
</script>`,
  };
}

function generateSendGridScript(config: Record<string, any>): IntegrationScript {
  // SendGrid is typically used server-side, but can embed forms
  return {
    body: `<!-- SendGrid Integration -->
<script>
  window.SENDGRID_CONFIG = ${JSON.stringify(config)};
</script>`,
  };
}

function generateConvertKitScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  const formId = config.formId;
  if (!formId) return {};
  
  return {
    body: `<!-- ConvertKit -->
<script src="https://f.convertkit.com/ckjs/ck.5.js"></script>
<script>
  ConvertKit.init({
    apiKey: '${apiKey}',
    formId: ${formId}
  });
</script>`,
  };
}

function generateConstantContactScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  if (!apiKey) return {};
  
  return {
    body: `<!-- Constant Contact -->
<script type="text/javascript" src="https://static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js" async defer></script>`,
  };
}

function generateCampaignMonitorScript(config: Record<string, any>): IntegrationScript {
  const apiKey = config.apiKey;
  const clientId = config.clientId;
  if (!apiKey || !clientId) return {};
  
  return {
    body: `<!-- Campaign Monitor -->
<script>
  window.CAMPAIGN_MONITOR_CONFIG = {
    apiKey: '${apiKey}',
    clientId: '${clientId}'
  };
</script>`,
  };
}

// ============================================
// SOCIAL SCRIPTS (Simplified - most use embeds)
// ============================================

function generateInstagramScript(config: Record<string, any>): IntegrationScript {
  const accessToken = config.accessToken;
  if (!accessToken) return {};
  
  return {
    body: `<!-- Instagram Feed -->
<script>
  window.INSTAGRAM_CONFIG = {
    accessToken: '${accessToken}',
    userId: '${config.userId || ''}'
  };
</script>`,
  };
}

function generateTwitterScript(_config: Record<string, any>): IntegrationScript {
  // Twitter/X embeds are typically done via widget.js
  return {
    body: `<!-- Twitter Widget -->
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`,
  };
}

function generateLinkedInScript(config: Record<string, any>): IntegrationScript {
  const companyId = config.companyId;
  if (!companyId) return {};
  
  return {
    body: `<!-- LinkedIn Company Page -->
<script src="https://platform.linkedin.com/in.js" type="text/javascript">
  lang: en_US
</script>`,
  };
}

function generateTikTokScript(_config: Record<string, any>): IntegrationScript {
  return {
    body: `<!-- TikTok Embed -->
<script async src="https://www.tiktok.com/embed.js"></script>`,
  };
}

function generatePinterestScript(_config: Record<string, any>): IntegrationScript {
  return {
    body: `<!-- Pinterest Widget -->
<script async defer src="https://assets.pinterest.com/js/pinit.js"></script>`,
  };
}

function generateYouTubeScript(_config: Record<string, any>): IntegrationScript {
  // YouTube uses iframe API
  return {
    body: `<!-- YouTube API -->
<script src="https://www.youtube.com/iframe_api"></script>`,
  };
}

// ============================================
// CRM SCRIPTS
// ============================================

function generateHubSpotCRMScript(config: Record<string, any>): IntegrationScript {
  const portalId = config.portalId;
  if (!portalId) return {};
  
  return {
    body: `<!-- HubSpot CRM -->
<script type="text/javascript" id="hs-script-loader" async defer src="//js.hs-scripts.com/${portalId}.js"></script>`,
  };
}

function generateSalesforceCRMScript(config: Record<string, any>): IntegrationScript {
  // Salesforce CRM is typically server-side, but can include tracking
  return {
    body: `<!-- Salesforce CRM -->
<script>
  window.SALESFORCE_CRM_CONFIG = ${JSON.stringify(config)};
</script>`,
  };
}

function generatePipedriveScript(config: Record<string, any>): IntegrationScript {
  const apiToken = config.apiToken;
  if (!apiToken) return {};
  
  return {
    body: `<!-- Pipedrive -->
<script>
  window.PIPEDRIVE_CONFIG = {
    apiToken: '${apiToken}'
  };
</script>`,
  };
}

function generateZohoCRMScript(config: Record<string, any>): IntegrationScript {
  const accessToken = config.accessToken;
  const clientId = config.clientId;
  if (!accessToken || !clientId) return {};
  
  return {
    body: `<!-- Zoho CRM -->
<script>
  window.ZOHO_CRM_CONFIG = {
    accessToken: '${accessToken}',
    clientId: '${clientId}'
  };
</script>`,
  };
}

// ============================================
// AUTOMATION SCRIPTS
// ============================================

function generateZapierScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- Zapier Webhook Integration -->
<script>
  window.ZAPIER_WEBHOOK_URL = '${webhookUrl}';
  window.sendToZapier = function(eventType, data) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: eventType,
        timestamp: new Date().toISOString(),
        ...data
      })
    }).catch(function(error) {
      console.error('Zapier webhook error:', error);
    });
  };
  document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.tagName === 'FORM') {
      const formData = new FormData(form);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });
      sendToZapier('form_submission', {
        formId: form.id || 'unknown',
        formData: formObject
      });
    }
  });
</script>`,
  };
}

function generateMakeScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- Make (Integromat) Webhook -->
<script>
  window.MAKE_WEBHOOK_URL = '${webhookUrl}';
  window.sendToMake = function(data) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error);
  };
</script>`,
  };
}

function generateIFTTTScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- IFTTT Webhook -->
<script>
  window.IFTTT_WEBHOOK_URL = '${webhookUrl}';
  window.sendToIFTTT = function(value1, value2, value3) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value1, value2, value3 })
    }).catch(console.error);
  };
</script>`,
  };
}

function generateN8NScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- n8n Webhook -->
<script>
  window.N8N_WEBHOOK_URL = '${webhookUrl}';
  window.sendToN8N = function(data) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error);
  };
</script>`,
  };
}

// ============================================
// E-COMMERCE SCRIPTS
// ============================================

function generateShopifyScript(config: Record<string, any>): IntegrationScript {
  const shopDomain = config.shopDomain;
  const accessToken = config.accessToken;
  if (!shopDomain || !accessToken) return {};
  
  return {
    body: `<!-- Shopify Integration -->
<script>
  window.SHOPIFY_CONFIG = {
    shopDomain: '${shopDomain}',
    accessToken: '${accessToken}'
  };
</script>`,
  };
}

function generateWooCommerceScript(config: Record<string, any>): IntegrationScript {
  const storeUrl = config.storeUrl;
  if (!storeUrl) return {};
  
  return {
    body: `<!-- WooCommerce Integration -->
<script>
  window.WOOCOMMERCE_CONFIG = {
    storeUrl: '${storeUrl}',
    consumerKey: '${config.consumerKey || ''}',
    consumerSecret: '${config.consumerSecret || ''}'
  };
</script>`,
  };
}

function generateBigCommerceScript(config: Record<string, any>): IntegrationScript {
  const storeHash = config.storeHash;
  const accessToken = config.accessToken;
  if (!storeHash || !accessToken) return {};
  
  return {
    body: `<!-- BigCommerce Integration -->
<script>
  window.BIGCOMMERCE_CONFIG = {
    storeHash: '${storeHash}',
    accessToken: '${accessToken}'
  };
</script>`,
  };
}

// ============================================
// CUSTOMER SUPPORT SCRIPTS
// ============================================

function generateIntercomScript(config: Record<string, any>): IntegrationScript {
  const appId = config.appId;
  if (!appId) return {};
  
  return {
    body: `<!-- Intercom -->
<script>
  (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
</script>`,
  };
}

function generateZendeskScript(config: Record<string, any>): IntegrationScript {
  const accountId = config.accountId;
  if (!accountId) return {};
  
  return {
    body: `<!-- Zendesk -->
<script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=${accountId}"></script>`,
  };
}

function generateFreshdeskScript(config: Record<string, any>): IntegrationScript {
  const domain = config.domain;
  if (!domain) return {};
  
  return {
    body: `<!-- Freshdesk -->
<script>
  window.fwSettings={
    'widget_id': '${domain}'
  };
  !function(){if("function"!=typeof window.FreshworksWidget){var n=function(){n.q.push(arguments)};n.q=[],window.FreshworksWidget=n}}();
</script>
<script type='text/javascript' src='https://widget.freshworks.com/widgets/${domain}.js' async defer></script>`,
  };
}

function generateDriftScript(config: Record<string, any>): IntegrationScript {
  const accountId = config.accountId;
  if (!accountId) return {};
  
  return {
    body: `<!-- Drift -->
<script>
  !function() {
    var t = window.driftt = window.drift = window.driftt || [];
    if (!t.init) {
      if (t.invoked) return void (window.console && console.error && console.error("Drift snippet included twice."));
      t.invoked = true;
      t.methods = [ "identify", "config", "track", "reset", "debug", "show", "ping", "page", "hide", "off", "on" ],
      t.factory = function(e) {
        return function() {
          var n = Array.prototype.slice.call(arguments);
          return n.unshift(e), t.push(n), t;
        };
      }, t.methods.forEach(function(e) {
        t[e] = t.factory(e);
      }), t.load = function(e, n) {
        var o = 3e5, i = Math.ceil(new Date() / o) * o, a = document.createElement("script");
        a.type = "text/javascript", a.async = true, a.crossorigin = "anonymous", a.src = "https://js.driftt.com/include/" + i + "/" + e + ".js";
        var n = document.getElementsByTagName("script")[0];
        n.parentNode.insertBefore(a, n);
      };
    }
  }();
  drift.SNIPPET_VERSION = '0.3.1';
  drift.load('${accountId}');
</script>`,
  };
}

function generateCrispScript(config: Record<string, any>): IntegrationScript {
  const websiteId = config.websiteId;
  if (!websiteId) return {};
  
  return {
    body: `<!-- Crisp -->
<script type="text/javascript">
  window.$crisp=[];window.CRISP_WEBSITE_ID="${websiteId}";
  (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
</script>`,
  };
}

function generateLiveChatScript(config: Record<string, any>): IntegrationScript {
  const licenseNumber = config.licenseNumber;
  if (!licenseNumber) return {};
  
  return {
    body: `<!-- LiveChat -->
<script>
  window.__lc = window.__lc || {};
  window.__lc.license = ${licenseNumber};
  (function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};
  !n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
</script>`,
  };
}

// ============================================
// FORMS SCRIPTS
// ============================================

function generateTypeformScript(config: Record<string, any>): IntegrationScript {
  const formId = config.formId;
  if (!formId) return {};
  
  return {
    body: `<!-- Typeform -->
<script src="https://embed.typeform.com/next/embed.js"></script>`,
  };
}

function generateJotFormScript(config: Record<string, any>): IntegrationScript {
  const formId = config.formId;
  if (!formId) return {};
  
  return {
    body: `<!-- JotForm -->
<script type="text/javascript" src="https://form.jotform.com/jsform/${formId}"></script>`,
  };
}

function generateCalendlyScript(config: Record<string, any>): IntegrationScript {
  const username = config.username;
  if (!username) return {};
  
  return {
    body: `<!-- Calendly -->
<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>`,
  };
}

// ============================================
// COMMUNICATION SCRIPTS
// ============================================

function generateSlackScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- Slack Webhook -->
<script>
  window.SLACK_WEBHOOK_URL = '${webhookUrl}';
  window.sendToSlack = function(text, channel) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, channel: channel || '#general' })
    }).catch(console.error);
  };
</script>`,
  };
}

function generateDiscordScript(config: Record<string, any>): IntegrationScript {
  const webhookUrl = config.webhookUrl;
  if (!webhookUrl) return {};
  
  return {
    body: `<!-- Discord Webhook -->
<script>
  window.DISCORD_WEBHOOK_URL = '${webhookUrl}';
  window.sendToDiscord = function(content) {
    fetch('${webhookUrl}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    }).catch(console.error);
  };
</script>`,
  };
}

function generateTelegramScript(config: Record<string, any>): IntegrationScript {
  const botToken = config.botToken;
  const chatId = config.chatId;
  if (!botToken || !chatId) return {};
  
  return {
    body: `<!-- Telegram Bot -->
<script>
  window.TELEGRAM_CONFIG = {
    botToken: '${botToken}',
    chatId: '${chatId}'
  };
  window.sendToTelegram = function(text) {
    fetch(\`https://api.telegram.org/bot\${window.TELEGRAM_CONFIG.botToken}/sendMessage\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: window.TELEGRAM_CONFIG.chatId,
        text: text
      })
    }).catch(console.error);
  };
</script>`,
  };
}

function generateWhatsAppBusinessScript(config: Record<string, any>): IntegrationScript {
  const phoneNumberId = config.phoneNumberId;
  const accessToken = config.accessToken;
  if (!phoneNumberId || !accessToken) return {};
  
  return {
    body: `<!-- WhatsApp Business -->
<script>
  window.WHATSAPP_BUSINESS_CONFIG = {
    phoneNumberId: '${phoneNumberId}',
    accessToken: '${accessToken}'
  };
</script>`,
  };
}

function generateTwilioScript(config: Record<string, any>): IntegrationScript {
  // Twilio is typically server-side, but can include client-side helpers
  return {
    body: `<!-- Twilio Integration -->
<script>
  window.TWILIO_CONFIG = {
    accountSid: '${config.accountSid || ''}',
    authToken: '${config.authToken || ''}'
  };
</script>`,
  };
}

// ============================================
// OTHER SCRIPTS
// ============================================

function generateCloudflareScript(config: Record<string, any>): IntegrationScript {
  // Cloudflare is typically configured server-side, but can include Web Analytics
  return {
    head: `<!-- Cloudflare Web Analytics -->
<script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "${config.token || ''}"}'></script>`,
  };
}

