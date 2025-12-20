# Enterprise Features

## Overview

Enterprise-grade features including SSO authentication, white-labeling, custom domains, and team workspaces.

## Features

### Single Sign-On (SSO)
- **SAML 2.0** support
- **OAuth 2.0** support
- **OpenID Connect (OIDC)** support
- Session management
- Multi-provider support

### White-Labeling
- Custom branding
- Logo replacement
- Color customization
- Remove "Powered by" text
- Custom headers/footers

### Custom Domains
- Domain configuration
- SSL certificate management
- DNS verification
- Domain status tracking

### Team Workspaces
- Workspace creation
- Member management
- Role-based permissions
- Project organization

## API Endpoints

### SSO

#### POST /api/enterprise/sso/providers
Register SSO provider.

**Request:**
```json
{
  "id": "okta-saml",
  "name": "Okta SAML",
  "type": "saml",
  "enabled": true,
  "config": {
    "entityId": "https://example.okta.com",
    "ssoUrl": "https://example.okta.com/sso",
    "certificate": "..."
  }
}
```

#### GET /api/enterprise/sso/providers
List all SSO providers.

#### GET /api/enterprise/sso/auth/:providerId
Initiate SSO authentication.

#### GET /api/enterprise/sso/callback/:providerId
Handle SSO callback.

### White-Labeling

#### POST /api/enterprise/white-label/apply
Apply white-labeling to website.

**Request:**
```json
{
  "html": "<html>...</html>",
  "config": {
    "organizationId": "org-123",
    "brandName": "Custom Brand",
    "logoUrl": "https://example.com/logo.png",
    "faviconUrl": "https://example.com/favicon.ico",
    "primaryColor": "#FF0000",
    "secondaryColor": "#00FF00",
    "removePoweredBy": true,
    "customFooter": "<footer>...</footer>",
    "customHeader": "<header>...</header>"
  }
}
```

### Custom Domains

#### POST /api/enterprise/domains
Add custom domain.

**Request:**
```json
{
  "domain": "example.com",
  "websiteId": "website-123",
  "sslEnabled": true
}
```

#### GET /api/enterprise/domains/:websiteId
Get domains for website.

### Team Workspaces

#### POST /api/enterprise/workspaces
Create workspace.

**Request:**
```json
{
  "name": "Marketing Team",
  "organizationId": "org-123",
  "ownerId": "user-123"
}
```

#### GET /api/enterprise/workspaces
List user workspaces.

**Query Parameters:**
- `userId`: User ID

#### POST /api/enterprise/workspaces/:workspaceId/members
Add member to workspace.

**Request:**
```json
{
  "userId": "user-456",
  "role": "editor"
}
```

## Roles and Permissions

### Workspace Roles

- **owner**: Full access, can manage members and settings
- **admin**: Can manage members and settings, full content access
- **editor**: Can create and edit content
- **viewer**: Read-only access

## Frontend Component

Use the `EnterpriseSettings` component:

```tsx
import { EnterpriseSettings } from '@/components/Enterprise/EnterpriseSettings';

<EnterpriseSettings />
```

## SSO Configuration

### SAML Configuration
1. Register SAML provider with entity ID and SSO URL
2. Upload certificate for signature verification
3. Configure attribute mapping

### OAuth/OIDC Configuration
1. Register provider with client ID and secret
2. Configure authorization, token, and user info URLs
3. Set up redirect URIs

## White-Labeling Best Practices

1. **Brand Consistency**: Use consistent colors and logos
2. **Logo Quality**: Use high-resolution logos (SVG preferred)
3. **Color Accessibility**: Ensure sufficient contrast
4. **Custom CSS**: Test custom styles across browsers
5. **Legal Compliance**: Ensure white-labeling doesn't violate licenses

## Custom Domain Setup

1. **DNS Configuration**: Point domain to StargatePortal servers
2. **SSL Certificate**: Automatic SSL via Let's Encrypt
3. **Verification**: DNS verification required
4. **Status Tracking**: Monitor domain status (pending/active/failed)

## Team Workspace Management

1. **Create Workspace**: Set up team workspace with owner
2. **Invite Members**: Add team members with appropriate roles
3. **Manage Projects**: Organize projects within workspace
4. **Set Permissions**: Configure role-based access control

## Security Considerations

- **SSO Security**: Use HTTPS for all SSO endpoints
- **Session Management**: Implement proper session expiration
- **Domain Verification**: Verify domain ownership before activation
- **Permission Checks**: Always verify user permissions server-side

