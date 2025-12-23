import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Stargate Portal',
  description: 'AI-Powered Website Builder with Merlin Assistant & Leonardo AI',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.png',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Components', link: '/components/' },
      { text: 'Deployment', link: '/deployment/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'Core Concepts', link: '/guide/core-concepts' }
          ]
        },
        {
          text: 'Building Websites',
          items: [
            { text: 'Website Wizard', link: '/guide/website-wizard' },
            { text: 'Templates', link: '/guide/templates' },
            { text: 'Visual Editor', link: '/guide/visual-editor' },
            { text: 'AI Assistance', link: '/guide/ai-assistance' }
          ]
        },
        {
          text: 'AI Features',
          items: [
            { text: 'Merlin Assistant', link: '/guide/merlin' },
            { text: 'Leonardo AI Images', link: '/guide/leonardo' },
            { text: '10 AI Agents', link: '/guide/ai-agents' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' },
            { text: 'Authentication', link: '/api/auth' },
            { text: 'Projects', link: '/api/projects' },
            { text: 'Templates', link: '/api/templates' },
            { text: 'AI Generation', link: '/api/ai-generation' },
            { text: 'Image Generation', link: '/api/images' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Component Library',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Visual Editor', link: '/components/visual-editor' },
            { text: 'Mobile Editor', link: '/components/mobile-editor' },
            { text: 'Template Gallery', link: '/components/template-gallery' },
            { text: 'AI Chat', link: '/components/ai-chat' }
          ]
        }
      ],
      '/deployment/': [
        {
          text: 'Deployment',
          items: [
            { text: 'Overview', link: '/deployment/' },
            { text: 'Local Development', link: '/deployment/local' },
            { text: 'Azure Deployment', link: '/deployment/azure' },
            { text: 'Docker', link: '/deployment/docker' },
            { text: 'Production Checklist', link: '/deployment/production' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CodeMasters-AiFactory/Stargate' }
    ],

    footer: {
      message: 'Built with ❤️ by CodeMasters-AiFactory',
      copyright: 'Copyright © 2025 CodeMasters-AiFactory'
    },

    search: {
      provider: 'local'
    }
  }
})
